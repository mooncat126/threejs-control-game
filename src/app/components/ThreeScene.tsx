"use client"; // 标记为客户端组件

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FBXLoader, OrbitControls } from "three-stdlib";

const ThreeScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  let mixer: THREE.AnimationMixer | null = null;
  let wolf: THREE.Object3D | null = null;
  let actions: { [key: string]: THREE.AnimationAction } = {};
  let activeAction: THREE.AnimationAction | null = null;
  let isShiftPressed = false;
  let isSitting = false;

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();

    // 创建星星小球体
    const starGeometry = new THREE.SphereGeometry(0.1, 8, 8); // 小球体，半径为0.1
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // 白色小球体
    const stars = new THREE.InstancedMesh(starGeometry, starMaterial, 10000); // 创建10000个实例

    // 设置小球体的位置
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 10000; i++) {
      const x = THREE.MathUtils.randFloatSpread(200);
      const y = THREE.MathUtils.randFloatSpread(200);
      const z = THREE.MathUtils.randFloatSpread(200);
      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      stars.setMatrixAt(i, dummy.matrix);
    }
    scene.add(stars);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.minPolarAngle = Math.PI / 6;
    controls.maxPolarAngle = Math.PI / 2;

    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);

    const gridHelper = new THREE.GridHelper(200, 50);
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(50);
    scene.add(axesHelper);

    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x228b22 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);

    const loadingManager = new THREE.LoadingManager();
    loadingManager.onStart = () => console.log("Started loading model");
    loadingManager.onLoad = () => console.log("Loading complete");
    loadingManager.onError = () => console.error("Error loading model");

    // 加载模型的代码保持不变
    const loader1 = new FBXLoader(loadingManager);
    loader1.load("/models/Big_Old_House.fbx", (object) => {
      object.scale.set(0.002, 0.002, 0.002);
      object.position.set(0, 0, 0);
      scene.add(object);
      console.log("Big_Old_House loaded");
    });

    const loader2 = new FBXLoader(loadingManager);
    loader2.load("/models/City_House_2_BI.fbx", (object) => {
      object.scale.set(0.25, 0.25, 0.25);
      object.position.set(1, 0, 0);
      object.rotation.set(Math.PI / 2, Math.PI, Math.PI);
      scene.add(object);
      console.log("City_House_2_BI loaded");
    });

    const loader3 = new FBXLoader(loadingManager);
    loader3.load("/models/Wolf.fbx", (object) => {
      wolf = object;
      wolf.scale.set(0.011, 0.011, 0.011);
      wolf.position.set(2, 0, 0);
      scene.add(wolf);
      console.log("Wolf model loaded");

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

    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();
      if (mixer) mixer.update(delta);

      // 使星空慢慢旋转
      stars.rotation.y += 0.0005;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const switchAction = (newAction: THREE.AnimationAction | null) => {
      if (activeAction && newAction !== activeAction) activeAction.fadeOut(0.2);
      if (newAction) {
        if (newAction.getClip().name === "Wolf_Skeleton|Wolf_seat_") {
          newAction.loop = THREE.LoopOnce;
          newAction.clampWhenFinished = true;
        } else {
          newAction.loop = THREE.LoopRepeat;
        }
        newAction.reset().fadeIn(0.2).play();
      }
      activeAction = newAction;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!wolf) return;
      let moveSpeed = isShiftPressed ? 0.2 : 0.1;

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
        default:
          switchAction(actions["Wolf_Skeleton|Wolf_Idle_"]);
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift") isShiftPressed = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

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
