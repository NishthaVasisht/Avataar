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

        for (const url of AVATAR_URLS) {
          try {
            console.log(`🔄 Trying: ${url}`);
            gltf = await tryLoadUrl(url);
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

        // Soldier.glb is ~1.8m tall at scale 1
        // At scale 5.5 it is ~9.9 units tall
        // Origin is at FEET. Camera is at Y=13.1
        // So to show face: feet at Y=4, head at Y=4+9.9=13.9 ≈ camera Y ✓
        character.scale.set(5.5, 5.5, 5.5);
        character.position.set(0, 4, 0);
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
