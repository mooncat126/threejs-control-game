"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FBXLoader, OrbitControls } from "three-stdlib";

const ThreeScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null); // 用于引用渲染器挂载的 DOM 元素
  let mixer: THREE.AnimationMixer | null = null; // 动画混合器，用于处理模型动画
  let wolf: THREE.Object3D | null = null; // 存储加载的狼模型对象
  let actions: { [key: string]: THREE.AnimationAction } = {}; // 存储动画动作
  let activeAction: THREE.AnimationAction | null = null; // 当前激活的动画动作
  let isShiftPressed = false; // 用于跟踪 Shift 键是否按下
  let isSitting = false; // 用于跟踪狼是否处于坐下状态
  let isSpacePressed = false; // 用于跟踪空格键是否按下

  useEffect(() => {
    if (!mountRef.current) return;

    // 创建场景
    const scene = new THREE.Scene();

    // 创建星星的小球体
    const starGeometry = new THREE.SphereGeometry(0.1, 8, 8); // 定义小球体的几何形状
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // 白色小球体材质
    const stars = new THREE.InstancedMesh(starGeometry, starMaterial, 10000); // 创建 10000 个实例

    // 随机设置小球体的位置
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 10000; i++) {
      const x = THREE.MathUtils.randFloatSpread(200);
      const y = THREE.MathUtils.randFloatSpread(200);
      const z = THREE.MathUtils.randFloatSpread(200);
      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      stars.setMatrixAt(i, dummy.matrix);
    }
    scene.add(stars); // 将星星添加到场景中

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(20, 10, 50); // 设置相机位置

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight); // 设置渲染器大小
    renderer.setClearColor(0x000000, 1); // 设置背景颜色
    mountRef.current.appendChild(renderer.domElement); // 将渲染器的 DOM 元素添加到页面中

    // 创建轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 启用阻尼效果
    controls.dampingFactor = 0.25; // 阻尼系数
    controls.enableZoom = true; // 启用缩放
    controls.minPolarAngle = Math.PI / 6; // 最小极角
    controls.maxPolarAngle = Math.PI / 2; // 最大极角

    // 添加光源
    const light = new THREE.DirectionalLight(0xffffff, 4); // 创建方向光
    light.position.set(1, 1, 1).normalize(); // 设置光源位置
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040, 2); // 创建环境光
    scene.add(ambientLight);

    // 添加辅助网格和坐标轴
    const gridHelper = new THREE.GridHelper(200, 200);
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(200);
    scene.add(axesHelper);

    // 创建地面
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // 将地面旋转为水平
    ground.position.y = -0.5; // 设置地面位置
    scene.add(ground);

    // 创建加载管理器
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onStart = () => console.log("Started loading model");
    loadingManager.onLoad = () => console.log("Loading complete");
    loadingManager.onError = () => console.error("Error loading model");

    // 加载并添加第一个 house FBX 模型
    const loader1 = new FBXLoader(loadingManager);
    loader1.load("/models/house1/Big_Old_House.fbx", (object) => {
      object.scale.set(0.035, 0.035, 0.035); // 缩放模型
      object.position.set(2, 0, 0); // 设置模型位置
      scene.add(object);
      console.log("Big_Old_House loaded");
    });

    // 加载并添加第二个 house FBX 模型
    const loader2 = new FBXLoader(loadingManager);
    loader2.load("/models/house2/City_House_2_BI.fbx", (object) => {
      object.scale.set(3, 3, 3);
      object.position.set(18, 0, 0);
      object.rotation.set(Math.PI / 2, Math.PI, Math.PI);
      scene.add(object);
      console.log("City_House_2_BI loaded");
    });

    // 加载并添加第三个 wolf FBX 模型（狼）
    const loader3 = new FBXLoader(loadingManager);
    loader3.load("/models/wolf/Wolf.fbx", (object) => {
      wolf = object;
      wolf.scale.set(0.08, 0.08, 0.08);
      wolf.position.set(30, 0, 0);
      scene.add(wolf);
      console.log("Wolf model loaded");

      // 创建动画混合器并处理动画
      mixer = new THREE.AnimationMixer(wolf);
      if (object.animations.length > 0) {
        object.animations.forEach((clip) => {
          const action = mixer!.clipAction(clip);
          actions[clip.name] = action;
        });

        activeAction = actions["Wolf_Skeleton|Wolf_Idle_"];
        if (activeAction) activeAction.play();
      }
    });

    // 动画循环
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();
      if (mixer) mixer.update(delta); // 更新动画

      stars.rotation.y += 0.0005; // 使星空慢慢旋转

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 切换动画动作
    const switchAction = (newAction: THREE.AnimationAction | null, loop: boolean = true) => {
      if (activeAction && newAction !== activeAction) {
        activeAction.fadeOut(0.2); // 渐出当前动作
      }
      if (newAction) {
        newAction.reset().fadeIn(0.2).play(); // 渐入新动作并播放
        newAction.loop = loop ? THREE.LoopRepeat : THREE.LoopOnce;
        newAction.clampWhenFinished = !loop;
      }
      activeAction = newAction;
    };

    // 处理键盘按下事件
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!wolf) return;
      let moveSpeed = isShiftPressed ? 5 : 2;

      switch (event.key) {
        case "Shift":
          isShiftPressed = true;
          break;
        case "ArrowDown":
          wolf.position.z += moveSpeed;
          wolf.rotation.y = 0;
          switchAction(
            isShiftPressed
              ? actions["Wolf_Skeleton|Wolf_Run_Cycle_"]
              : actions["Wolf_Skeleton|Wolf_Walk_cycle_"]
          );
          break;
        case "ArrowUp":
          wolf.position.z -= moveSpeed;
          wolf.rotation.y = Math.PI;
          switchAction(
            isShiftPressed
              ? actions["Wolf_Skeleton|Wolf_Run_Cycle_"]
              : actions["Wolf_Skeleton|Wolf_Walk_cycle_"]
          );
          break;
        case "ArrowLeft":
          wolf.position.x -= moveSpeed;
          wolf.rotation.y = -Math.PI / 2;
          switchAction(
            isShiftPressed
              ? actions["Wolf_Skeleton|Wolf_Run_Cycle_"]
              : actions["Wolf_Skeleton|Wolf_Walk_cycle_"]
          );
          break;
        case "ArrowRight":
          wolf.position.x += moveSpeed;
          wolf.rotation.y = Math.PI / 2;
          switchAction(
            isShiftPressed
              ? actions["Wolf_Skeleton|Wolf_Run_Cycle_"]
              : actions["Wolf_Skeleton|Wolf_Walk_cycle_"]
          );
          break;
        case " ":
          if (!isSpacePressed) {
            isSpacePressed = true;
            isSitting = !isSitting;
            if (isSitting) {
              switchAction(actions["Wolf_Skeleton|Wolf_seat_"], false);
            } else {
              switchAction(actions["Wolf_Skeleton|Wolf_Idle_"]);
            }
          }
          break;
        default:
          switchAction(actions["Wolf_Skeleton|Wolf_Idle_"]);
          break;
      }
    };

    // 处理键盘松开事件
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        isShiftPressed = false;
      }
      if (event.key === " ") {
        isSpacePressed = false;
      }
    };

    // 添加事件监听器
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // 处理窗口大小调整
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // 清理副作用
    return () => {
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default ThreeScene;
