import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";

// Public female avatar GLBs — tries each in order until one loads
const AVATAR_URLS = [
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

  const tryLoadUrl = (url: string): Promise<GLTF> => {
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => resolve(gltf),
        undefined,
        (err) => reject(err)
      );
    });
  };

  const loadCharacter = () => {
    return new Promise<GLTF | null>(async (resolve, reject) => {
      try {
        // Try local avatar first, then fallback CDN URLs
        const urlsToTry = ["/models/my-avatar.glb", ...AVATAR_URLS];
        let gltf: GLTF | null = null;
        let loadedUrl = "";

        for (const url of urlsToTry) {
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

        // Scale & position tuned for camera: FOV 14.5, pos (0, 13.1, 24.7)
        if (loadedUrl.includes("my-avatar")) {
          character.scale.set(9, 9, 9);
          character.position.set(0, 3.5, 0);
        } else {
          // Soldier.glb is ~1.8m tall — scale up to match viewport
          character.scale.set(5.5, 5.5, 5.5);
          character.position.set(0, 2.8, 0);
        }

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
