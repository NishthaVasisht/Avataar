import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";
import { decryptFile } from "./decrypt";

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
        let blobUrl: string;
        let modelSource = "";

        // Try to load encrypted original character first
        try {
          console.log("🔓 Attempting to decrypt original character model...");
          const encryptedBlob = await decryptFile(
            "/models/character.enc?v=2",
            "MyCharacter12"
          );
          blobUrl = URL.createObjectURL(new Blob([encryptedBlob]));
          modelSource = "original";
          console.log("✅ Original encrypted model loaded!");
        } catch (error) {
          console.warn("⚠️ Encrypted model not found, falling back to your avatar...");
          blobUrl = "/models/my-avatar.glb";
          modelSource = "your-avatar";
        }

        let character: THREE.Object3D;
        loader.load(
          blobUrl,
          async (gltf) => {
            character = gltf.scene;
            
            // Scale appropriately based on model
            if (modelSource === "original") {
              character.scale.set(1, 1, 1);
            } else {
              character.scale.set(1.2, 1.2, 1.2); // Your avatar scale
            }
            
            character.position.set(0, 0, 0);
            
            await renderer.compileAsync(character, camera, scene);
            
            console.log(`✅ Character loaded from: ${modelSource}`);
            console.log(`📦 Model children count: ${character.children.length}`);

            character.traverse((child: any) => {
              if (child.isMesh) {
                const mesh = child as THREE.Mesh;

                // Change clothing colors
                if (mesh.material) {
                  if (mesh.name === "BODY.SHIRT") {
                    const newMat = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
                    newMat.color = new THREE.Color("#8B4513");
                    mesh.material = newMat;
                    console.log("✅ Shirt colored");
                  } else if (mesh.name === "Pant") {
                    const newMat = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
                    newMat.color = new THREE.Color("#000000");
                    mesh.material = newMat;
                    console.log("✅ Pants colored");
                  }
                }

                child.castShadow = true;
                child.receiveShadow = true;
                mesh.frustumCulled = true;
              }
            });

            resolve(gltf);
            setCharTimeline(character, camera);
            setAllTimeline();

            // Adjust feet if they exist
            const footR = character.getObjectByName("footR");
            const footL = character.getObjectByName("footL");
            
            if (footR) footR.position.y = 3.36;
            if (footL) footL.position.y = 3.36;

            if (!footR || !footL) {
              console.warn("⚠️ Foot bones not found - model may not have them");
            }

            dracoLoader.dispose();
          },
          (progress) => {
            const percentComplete = (progress.loaded / progress.total) * 100;
            console.log(`📥 Loading: ${percentComplete.toFixed(0)}%`);
          },
          (error) => {
            console.error("❌ Error loading character:", error);
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