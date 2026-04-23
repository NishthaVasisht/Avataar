import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";

// Ready Player Me female avatar (public GLB)
const AVATAR_URL =
  "https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=ARKit&textureAtlas=1024";

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = () => {
    return new Promise<GLTF | null>(async (resolve, reject) => {
      try {
        console.log("👤 Loading female avatar...");

        loader.load(
          AVATAR_URL,
          async (gltf) => {
            const character = gltf.scene;

            // Match original repo scale & position so she fills the canvas correctly
            character.scale.set(9, 9, 9);
            character.position.set(0, 3.5, 0);
            character.rotation.y = 0;

            await renderer.compileAsync(character, camera, scene);

            console.log("✅ Female avatar loaded!");
            console.log(`📦 Model children: ${character.children.length}`);

            // Log all mesh names for debugging
            character.traverse((child: any) => {
              if (child.isMesh) {
                console.log("📌 Mesh:", child.name);
                child.castShadow = true;
                child.receiveShadow = true;
                (child as THREE.Mesh).frustumCulled = true;
              }
            });

            resolve(gltf);
            setCharTimeline(character, camera);
            setAllTimeline();

            dracoLoader.dispose();
          },
          (progress) => {
            if (progress.total > 0) {
              const pct = ((progress.loaded / progress.total) * 100).toFixed(0);
              console.log(`📥 Loading: ${pct}%`);
            }
          },
          (error) => {
            console.error("❌ Error loading avatar:", error);
            reject(error);
          }
        );
      } catch (err) {
        reject(err);
        console.error("❌ Error in setCharacter:", err);
      }
    });
  };

  return { loadCharacter };
};

export default setCharacter;
