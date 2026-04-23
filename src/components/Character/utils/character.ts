import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";

// Public GLB fallback URLs — tried in order
const AVATAR_URLS = [
  "/models/my-avatar.glb",
  "https://threejs.org/examples/models/gltf/Soldier.glb",
];

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const tryLoadUrl = (url: string): Promise<GLTF> =>
    new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });

  const loadCharacter = () => {
    return new Promise<GLTF | null>(async (resolve, reject) => {
      try {
        let gltf: GLTF | null = null;
        let loadedUrl = "";

        for (const url of AVATAR_URLS) {
          try {
            console.log(`🔄 Trying: ${url}`);
            gltf = await tryLoadUrl(url);
            loadedUrl = url;
            console.log(`✅ Loaded from: ${url}`);
            break;
          } catch (e) {
            console.warn(`⚠️ Failed: ${url}`);
          }
        }

        if (!gltf) {
          reject(new Error("All avatar sources failed to load."));
          return;
        }

        const character = gltf.scene;

        // Camera: FOV 14.5, position (0, 13.1, 24.7)
        // Scale 5.5 is correct size
        // Y 13.5 = camera Y level, so face aligns with center of viewport
        character.scale.set(5.5, 5.5, 5.5);
        character.position.set(0, 13.5, 0);
        character.rotation.y = 0;

        await renderer.compileAsync(character, camera, scene);

        console.log("✅ Character ready!");
        character.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            (child as THREE.Mesh).frustumCulled = true;
          }
        });

        resolve(gltf);
        setCharTimeline(character, camera);
        setAllTimeline();
        dracoLoader.dispose();
      } catch (err) {
        reject(err);
        console.error("❌ Error in setCharacter:", err);
      }
    });
  };

  return { loadCharacter };
};

export default setCharacter;
