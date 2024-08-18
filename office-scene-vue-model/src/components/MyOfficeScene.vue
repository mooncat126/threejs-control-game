<template>
  <div class="three-container" ref="divDom"></div>
</template>

<script>
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { onMounted, getCurrentInstance } from 'vue'
import { useThemeState } from '@/store'
import gsap from 'gsap'

export default {
  name: 'MyOfficeScene',
  setup() {
    const scene = new THREE.Scene()
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
    })
    renderer.useLegacyLights = true
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    let chair = null,
      screen = null,
      lampMesh = null,
      macKey = null,
      originalMaterial = null // 用于存储 mac-keys 的原始材质

    const chairAnimate = () => {
      gsap.to(chair.rotation, {
        y: 0.7,
        duration: 10,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true,
      })
    }

    const setScreen = () => {
      const video = document.createElement('video')
      video.src = '/3D/cat.mp4'
      video.muted = true
      video.playsInline = true
      video.autoplay = true
      video.loop = true
      video.play()
      const videoTexture = new THREE.VideoTexture(video)
      videoTexture.minFilter = THREE.NearestFilter
      videoTexture.magFilter = THREE.NearestFilter
      videoTexture.generateMipmaps = false
      videoTexture.encoding = THREE.sRGBEncoding
      screen.material = new THREE.MeshStandardMaterial({
        map: videoTexture,
      })
    }

    const gltfLoader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')
    gltfLoader.setDRACOLoader(dracoLoader)
    gltfLoader.load('/3D/officeScene.glb', (glb) => {
      glb.scene.scale.set(1.8, 1.8, 1.8)
      glb.scene.position.y = -1.5

      glb.scene.children.forEach((item) => {
        console.log(item)
        item.castShadow = true
        item.receiveShadow = true

        if (item.name === 'Chair') {
          chair = item
        } else if (item.name === 'mac-screen') {
          screen = item
        } else if (item.name === '_台灯') {
          lampMesh = item
        } else if (item.name === 'mac-keys') {
          macKey = item
          originalMaterial = item.material.clone() // 克隆并保存原始材质
        }
      })

      chairAnimate()
      setScreen()
      scene.add(glb.scene)
      renderer.render(scene, camera)
    })

    const camera = new THREE.OrthographicCamera()
    camera.position.set(-9.72, 5.27, -2.25)
    camera.lookAt(0, 0, 0)

    const ambient = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambient)

    const sunLight = new THREE.DirectionalLight(0xffffff)
    sunLight.castShadow = true
    sunLight.shadow.camera.far = 20
    sunLight.shadow.mapSize.set(2048, 2048)
    sunLight.shadow.normalBias = 0.05
    sunLight.position.set(-1.5, 7, 3)
    scene.add(sunLight)

    // 台灯光源
    const pointLight = new THREE.PointLight(0xffffff)
    pointLight.castShadow = true
    pointLight.position.set(0.6, 4, -2.3)
    pointLight.shadow.camera.far = 20
    pointLight.shadow.mapSize.set(2048, 2048)
    pointLight.shadow.normalBias = 0.05
    scene.add(pointLight)

    // 添加比桌子稍大的小毯子
    const addCarpet = () => {
      const carpetGeometry = new THREE.PlaneGeometry(13.5, 12.5) // 调整毯子的大小
      const carpetMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }) // 设置毯子的颜色（棕色）
      const carpet = new THREE.Mesh(carpetGeometry, carpetMaterial)

      carpet.rotation.x = -Math.PI / 2 // 使平面水平放置
      carpet.position.set(0, -1.49, 0) // 使毯子放置在地面上，位置根据场景调整

      carpet.receiveShadow = true // 使毯子接收阴影
      scene.add(carpet)
    }
    addCarpet()

    const size = {
      width: 0,
      height: 0,
      aspect: 1,
      frustrum: 10,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
    }

    const pageInstance = getCurrentInstance()
    const initSize = () => {
      size.width = pageInstance.refs.divDom.offsetWidth
      size.height = pageInstance.refs.divDom.offsetHeight
      size.aspect = size.width / size.height
      size.pixelRatio = Math.min(window.devicePixelRatio, 3)
      camera.left = (-size.aspect * size.frustrum) / 2
      camera.right = (size.aspect * size.frustrum) / 2
      camera.top = size.frustrum / 2
      camera.bottom = -size.frustrum / 2
      camera.updateProjectionMatrix()
      renderer.setSize(size.width, size.height)
      renderer.setPixelRatio(size.pixelRatio)
    }

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true // 开启阻尼（惯性）
    controls.dampingFactor = 0.25 // 阻尼系数
    controls.screenSpacePanning = false // 禁止摄像机平移

    // 允许水平和垂直方向的 360 度旋转
    controls.minPolarAngle = 0 // 垂直旋转的最小角度（0度）
    controls.maxPolarAngle = Math.PI // 垂直旋转的最大角度（180度）
    controls.minAzimuthAngle = -Infinity // 水平旋转的最小角度
    controls.maxAzimuthAngle = Infinity // 水平旋转的最大角度

    const animate = () => {
      requestAnimationFrame(animate)
      controls.update() // 更新控制器状态
      renderer.render(scene, camera)
    }

    // 创建发光材质
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000, // 保持键盘整体颜色不变
      emissive: 0xadd8e6, // 发光颜色为浅蓝色（接近蓝白光）
      emissiveIntensity: 5, // 发光强度
      transparent: true, // 使材质透明，显示发光部分
    })

    // 使用useThemeState
    const themeState = useThemeState()
    const theme = themeState.theme

    const toggleTheme = () => {
      themeState.toggleTheme() // 调用store中的切换主题方法

      if (theme.value === 'light') {
        gsap.to(sunLight, {
          intensity: 0.78,
        })
        gsap.to(ambient, {
          intensity: 0.78,
        })
        gsap.to(pointLight, {
          intensity: 0,
        })
        gsap.to(ambient.color, {
          r: 1,
          g: 1,
          b: 1,
        })
        if (macKey) {
          macKey.material = originalMaterial; // 开灯时恢复原始材质
        }
      } else {
        gsap.to(sunLight, {
          intensity: 0,
        })
        gsap.to(ambient, {
          intensity: 1.03,
        })
        gsap.to(pointLight, {
          intensity: 1.68,
        })
        gsap.to(ambient.color, {
          b: 0.9568627450980393,
          g: 0.24313725490196078,
          r: 0.3607843137254902,
        })
        if (macKey) {
          macKey.material = glowMaterial; // 关灯时切换到发光材质
        }
      }
    }

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const onClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)

      // 确保 `lampMesh` 已经被正确赋值
      if (lampMesh) {
        const intersects = raycaster.intersectObject(lampMesh, true)

        if (intersects.length > 0) {
          toggleTheme() // 触发主题切换
        }
      }
    }

    onMounted(() => {
      initSize()
      animate()
      pageInstance.refs.divDom.appendChild(renderer.domElement)
      window.addEventListener('click', onClick)
    })

    return {}
  },
}
</script>

<style lang="scss" scoped>
.three-container {
  width: 100%;
  height: 100%;
}
</style>
