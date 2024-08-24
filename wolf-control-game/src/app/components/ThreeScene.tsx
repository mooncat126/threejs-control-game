"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { FBXLoader, OrbitControls } from "three-stdlib";

const ThreeScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  // 保存 requestAnimationFrame ID
  const animationFrameIdRef = useRef<number | null>(null); 

  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const wolfRef = useRef<THREE.Object3D | null>(null);
  const actionsRef = useRef<{ [key: string]: THREE.AnimationAction }>({});
  const activeActionRef = useRef<THREE.AnimationAction | null>(null);
  const isShiftPressedRef = useRef(false);
  const isSittingRef = useRef(false);
  const isSpacePressedRef = useRef(false);

  // 初始化场景
  const initScene = useCallback(() => {
    const scene = new THREE.Scene();

    const starGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const stars = new THREE.InstancedMesh(starGeometry, starMaterial, 10000);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < 10000; i++) {
      dummy.position.set(
        THREE.MathUtils.randFloatSpread(200),
        THREE.MathUtils.randFloatSpread(200),
        THREE.MathUtils.randFloatSpread(200)
      );
      dummy.updateMatrix();
      stars.setMatrixAt(i, dummy.matrix);
    }
    scene.add(stars);

    return { scene, stars };
  }, []);

  // 初始化相机
  const initCamera = useCallback(() => {
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(20, 10, 50);
    return camera as THREE.PerspectiveCamera;
  }, []);

  // 初始化渲染器，并根据设备性能自动调整分辨率
  const initRenderer = useCallback(() => {
    const renderer = new THREE.WebGLRenderer();
    const pixelRatio = Math.min(window.devicePixelRatio, 2); // 设备像素比，最高为2
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    return renderer;
  }, []);

  // 初始化控制器
  const initControls = useCallback(
    (camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;
      controls.enableZoom = true;
      controls.minPolarAngle = Math.PI / 6;
      controls.maxPolarAngle = Math.PI / 2;
      return controls;
    },
    []
  );

  // 初始化光源
  const initLights = useCallback((scene: THREE.Scene) => {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
  }, []);

  // 初始化辅助网格和坐标轴
  const initHelpers = useCallback((scene: THREE.Scene) => {
    const gridHelper = new THREE.GridHelper(200, 200);
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(200);
    scene.add(axesHelper);
  }, []);

  // 初始化地面
  const initGround = useCallback((scene: THREE.Scene) => {
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);
  }, []);

  // 延迟加载模型
  const loadModels = useCallback((scene: THREE.Scene) => {
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onStart = () => console.log("Started loading model");
    loadingManager.onLoad = () => console.log("Loading complete");
    loadingManager.onError = () => console.error("Error loading model");

    const loader = new FBXLoader(loadingManager);

    const loadModel = (
      path: string,
      scale: THREE.Vector3,
      position: THREE.Vector3,
      rotation?: THREE.Euler
    ) => {
      loader.load(path, (object) => {
        object.scale.copy(scale);
        object.position.copy(position);
        if (rotation) object.rotation.copy(rotation);
        scene.add(object);
        console.log(`${path} loaded`);
      });
    };

    loadModel(
      "/models/house1/Big_Old_House.fbx",
      new THREE.Vector3(0.035, 0.035, 0.035),
      new THREE.Vector3(2, 0, 0)
    );
    loadModel(
      "/models/house2/City_House_2_BI.fbx",
      new THREE.Vector3(3, 3, 3),
      new THREE.Vector3(18, 0, 0),
      new THREE.Euler(Math.PI / 2, Math.PI, Math.PI)
    );

    loader.load("/models/wolf/Wolf.fbx", (object) => {
      wolfRef.current = object;
      wolfRef.current.scale.set(0.08, 0.08, 0.08);
      wolfRef.current.position.set(30, 0, 0);
      scene.add(wolfRef.current);
      console.log("Wolf model loaded");

      mixerRef.current = new THREE.AnimationMixer(wolfRef.current);
      if (object.animations.length > 0) {
        object.animations.forEach((clip) => {
          const action = mixerRef.current!.clipAction(clip);
          actionsRef.current[clip.name] = action;
        });

        activeActionRef.current =
          actionsRef.current["Wolf_Skeleton|Wolf_Idle_"];
        if (activeActionRef.current) activeActionRef.current.play();
      }
    });
  }, []);

  // 动画循环
  const animate = useCallback(
    (
      renderer: THREE.WebGLRenderer,
      scene: THREE.Scene,
      camera: THREE.Camera,
      controls: OrbitControls,
      stars: THREE.InstancedMesh
    ) => {
      const clock = new THREE.Clock();

      const render = () => {
        // 在渲染前，存储 animation frame ID
        animationFrameIdRef.current = requestAnimationFrame(render);

        const delta = clock.getDelta();
        if (mixerRef.current) mixerRef.current.update(delta);

        stars.rotation.y += 0.0005;

        controls.update();
        renderer.render(scene, camera);
      };

      render();
    },
    []
  );

  // 获取移动相关的动画动作
  const getActionForMovement = useCallback(() => {
    return isShiftPressedRef.current
      ? actionsRef.current["Wolf_Skeleton|Wolf_Run_Cycle_"]
      : actionsRef.current["Wolf_Skeleton|Wolf_Walk_cycle_"];
  }, []);

  // 切换动画动作
  const switchAction = useCallback(
    (newAction: THREE.AnimationAction | null, loop: boolean = true) => {
      if (activeActionRef.current && newAction !== activeActionRef.current) {
        activeActionRef.current.fadeOut(0.2);
      }
      if (newAction) {
        newAction.reset().fadeIn(0.2).play();
        newAction.loop = loop ? THREE.LoopRepeat : THREE.LoopOnce;
        newAction.clampWhenFinished = !loop;
      }
      activeActionRef.current = newAction;
    },
    []
  );

  // 处理键盘按下事件
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const wolf = wolfRef.current;
      if (!wolf) return;
      const moveSpeed = isShiftPressedRef.current ? 5 : 2;

      switch (event.key) {
        case "Shift":
          isShiftPressedRef.current = true;
          break;
        case "ArrowDown":
          wolf.position.z += moveSpeed;
          wolf.rotation.y = 0;
          switchAction(getActionForMovement());
          break;
        case "ArrowUp":
          wolf.position.z -= moveSpeed;
          wolf.rotation.y = Math.PI;
          switchAction(getActionForMovement());
          break;
        case "ArrowLeft":
          wolf.position.x -= moveSpeed;
          wolf.rotation.y = -Math.PI / 2;
          switchAction(getActionForMovement());
          break;
        case "ArrowRight":
          wolf.position.x += moveSpeed;
          wolf.rotation.y = Math.PI / 2;
          switchAction(getActionForMovement());
          break;
        case " ":
          if (!isSpacePressedRef.current) {
            isSpacePressedRef.current = true;
            isSittingRef.current = !isSittingRef.current;
            if (isSittingRef.current) {
              switchAction(
                actionsRef.current["Wolf_Skeleton|Wolf_seat_"],
                false
              );
            } else {
              switchAction(actionsRef.current["Wolf_Skeleton|Wolf_Idle_"]);
            }
          }
          break;
        default:
          switchAction(actionsRef.current["Wolf_Skeleton|Wolf_Idle_"]);
          break;
      }
    },
    [switchAction, getActionForMovement]
  );

  // 处理键盘松开事件
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.key === "Shift") {
      isShiftPressedRef.current = false;
    }
    if (event.key === " ") {
      isSpacePressedRef.current = false;
    }
  }, []);

  // 处理窗口大小调整
  const handleResize = useCallback(
    (camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
      return () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
    },
    []
  );

  // 事件监听器和清理函数统一管理
  const addEventListeners = useCallback(
    (camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      window.addEventListener("resize", handleResize(camera, renderer));
    },
    [handleKeyDown, handleKeyUp, handleResize]
  );

  const removeEventListeners = useCallback(
    (camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", handleResize(camera, renderer));
    },
    [handleKeyDown, handleKeyUp, handleResize]
  );

  useEffect(() => {
    if (!mountRef.current) return;

    const { scene, stars } = initScene();
    const camera = initCamera();
    const renderer = initRenderer();
    const controls = initControls(camera, renderer);
    initLights(scene);
    initHelpers(scene);
    initGround(scene);
    loadModels(scene);

    mountRef.current.appendChild(renderer.domElement);

    animate(renderer, scene, camera, controls, stars);
    addEventListeners(camera, renderer);

    // 清理副作用
    return () => {
      // 取消未完成的动画帧
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
      removeEventListeners(camera, renderer);
    };
  }, [
    initScene,
    initCamera,
    initRenderer,
    initControls,
    initLights,
    initHelpers,
    initGround,
    loadModels,
    animate,
    addEventListeners,
    removeEventListeners,
  ]);

  return <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default ThreeScene;
