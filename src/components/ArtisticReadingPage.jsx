import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { Sparkles, Wand2, ArrowLeft, Camera as CameraIcon, CameraOff, Move3d, CheckCircle2, RefreshCw, Hand, Flame } from 'lucide-react';

// tween.js v25: `new TWEEN.Tween(obj)` KHÔNG tự thêm tween vào group mặc định nữa, nên
// TWEEN.update() không bao giờ chạy tween. Truyền `true` làm tham số thứ 2 để khôi phục
// hành vi cũ (tự thêm vào global group). createTween bọc sẵn điều này cho mọi tween.
const createTween = (obj) => new TWEEN.Tween(obj, true);

// Create 3D Rounded Corner Geometry for cards — bo góc như CSS border-radius.
// ExtrudeGeometry gộp 2 mặt nắp chung 1 group, nên tách lại thành 3 group riêng:
//   group 0 = mặt +Z (mặt trước, hướng về camera khi card xoay y = 0)
//   group 1 = mặt -Z (mặt sau)
//   group 2 = cạnh (side walls, màu vàng)
function createRoundedCardGeometry(width, height, radius, depth) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;

  shape.moveTo(x, y + radius);
  shape.lineTo(x, y + height - radius);
  shape.quadraticCurveTo(x, y + height, x + radius, y + height);
  shape.lineTo(x + width - radius, y + height);
  shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
  shape.lineTo(x + width, y + radius);
  shape.quadraticCurveTo(x + width, y, x + width - radius, y);
  shape.lineTo(x + radius, y);
  shape.quadraticCurveTo(x, y, x, y + radius);

  const geo = new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: false });
  geo.center();

  const pos = geo.attributes.position;
  const norm = geo.attributes.normal;
  const uvs = geo.attributes.uv;

  // Tách group theo loại mặt. LƯU Ý: thứ tự đỉnh của ExtrudeGeometry là [-Z, +Z, cạnh]
  // nên KHÔNG được giả định group 0 là mặt +Z. Dò theo từng dải liên tục (run) và gán
  // materialIndex theo loại: +Z -> 0, -Z -> 1, cạnh -> 2 (robust, không phụ thuộc thứ tự).
  const typeToMat = (nz) => (nz > 0.5 ? 0 : nz < -0.5 ? 1 : 2);
  const groups = [];
  let runStart = 0;
  let prevMat = typeToMat(norm.getZ(0));
  for (let i = 1; i <= pos.count; i++) {
    const mat = i < pos.count ? typeToMat(norm.getZ(i)) : -1;
    if (i === pos.count || mat !== prevMat) {
      groups.push({ start: runStart, count: i - runStart, materialIndex: prevMat });
      runStart = i;
      prevMat = mat;
    }
  }
  geo.groups = groups;

  // Remap UV về [0,1] cho mặt nắp để ảnh phủ đầy mặt bài (mặt +Z hiện ảnh đứng đúng)
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    uvs.setXY(i, px / width + 0.5, py / height + 0.5);
  }
  uvs.needsUpdate = true;

  return geo;
}

// Star image files in public/Star_img/rm_bg (Randomized from D:\bản đồ sao\fairy tale lenormand\Star_img\rm_bg)
const STAR_IMAGES = [
  '/Star_img/rm_bg/tải xuống (1).png',
  '/Star_img/rm_bg/tải xuống (2).png',
  '/Star_img/rm_bg/tải xuống.png',
  '/Star_img/rm_bg/☆.png',
  '/star_img/Gemini_Generated_Image_f80wluf80wluf80w-Photoroom.png',
  '/star_img/Gemini_Generated_Image_f80wluf80wluf80w.png',
  '/star_img/Gemini_Generated_Image_oe4os9oe4os9oe4o.png'
];

// Card front image filenames mapping function (D:\bản đồ sao\fairy tale lenormand\Img_FairyDreamTale_Lenoamd-20260730T165425Z-1-001\card_pro)
const getCardFrontImg = (cardId) => {
  const cardMap = {
    1: '01 - Rider - Kỵ sĩ.png',
    2: '02 - Clover - Cỏ 4 lá.png',
    3: '03 - Ship - Con tàu.png',
    4: '04 - House - Ngôi nhà.png',
    5: '05 - Tree - Cái cây.png',
    6: '06 - Clouds - Mây.png',
    7: '07 - Snake - Con rắn.png',
    8: '08 - Coffin - Quan tài.png',
    9: '09 - Bouquet - Bó hoa.png',
    10: '10 - Scythe - Lưỡi liềm.png',
    11: '11 - Whip - Cái roi.png',
    12: '12 - Birds - Chim sẻ.png',
    13: '13 - Child - Đứa trẻ.png',
    14: '14 - Fox - Con cáo.png',
    15: '15 - Bear - Con gấu.png',
    16: '16 - Stars - Ngôi sao.png',
    17: '17 - Stork - Con cò.png',
    18: '18 - Dog - Con chó.png',
    19: '19 - Tower - Tháp.png',
    20: '20 - Garden - Vườn.png',
    21: '21 - Mountain - Ngọn núi.png',
    22: '22 - Crossroads - Ngã tư.png',
    23: '23 - Mice - Con chuột.png',
    24: '24 - Heart - Trái tim.png',
    25: '25 - Ring - Chiếc nhẫn.png',
    26: '26 - Book - Cuốn sách.png',
    27: '27 - Letter - Bức thư.png',
    28: '28 - Man - Người đàn ông.png',
    29: '29 - Woman - Người phụ nữ.png',
    30: '30 - Lilies - Hoa huệ.png',
    31: '31 - Sun - Mặt trời.png',
    32: '32 - Moon - Mặt trăng.png',
    33: '33 - Key - Chìa khóa.png',
    34: '34 - Fish - Con cá.png',
    35: '35 - Anchor - Cái neo.png',
    36: '36 - Cross - Cái thập tự.png',
    37: '37 - Spirit - Linh hồn.png',
    38: '38 - Incense - Lư hương.png',
    39: '39 - Bed - Giường.png',
    40: '40 - Market - Thị trường.png',
    41: '41 - Man (Nam Phụ) - Người đàn ông (Nam phụ).png',
    42: '42 - Woman (Nữ Phụ) - Người phụ nữ (Nữ phụ).png'
  };

  const filename = cardMap[cardId] || '01 - Rider - Kỵ sĩ.png';
  return `/card_pro/${encodeURIComponent(filename)}`;
};

// Card back image path
const CARD_BACK_IMAGE = '/Img_FairyDreamTale_Lenoamd-20260730T165425Z-1-001/Gemini_Generated_Image_5uo6dm5uo6dm5uo6.png';

// Generate particle texture for Tarotcuabin explosion effect
function generateParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');      
  grad.addColorStop(0.3, 'rgba(212, 175, 55, 0.9)'); 
  grad.addColorStop(0.7, 'rgba(147, 51, 234, 0.5)'); 
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');     
  
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  
  const tex = new THREE.Texture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// Helper to load external scripts dynamically for MediaPipe
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.crossOrigin = 'anonymous';
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

export default function ArtisticReadingPage({ cardsData, onBackToHome }) {
  // Step state: 'setup' -> 'picking' -> 'result'
  const [step, setStep] = useState('setup');
  const [question, setQuestion] = useState('');
  const [spreadCount, setSpreadCount] = useState(3); // 1, 3, or 9
  const [pickedCardIds, setPickedCardIds] = useState([]);
  const [isPickingCard, setIsPickingCard] = useState(false);
  
  // Game Active State
  const [isGameActive, setIsGameActive] = useState(true);

  // Three.js Canvas Container Ref
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const cardGroupRef = useRef(null);

  // MEDIAPIPE HAND TRACKING & VIRTUAL CURSOR STATE
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [handDetected, setHandDetected] = useState(false);
  const [handCursor, setHandCursor] = useState({ x: -100, y: -100, isPinching: false });
  const [handDirection, setHandDirection] = useState('center'); // 'left', 'right', 'center'
  const videoRef = useRef(null);
  const mediaPipeCameraRef = useRef(null);

  // Reference variables for LERP cursor smoothing & render loop hand control
  const handSpeedRef = useRef(0.0015);
  const handPinchTriggerRef = useRef(false);
  const isPinchingRef = useRef(false);
  const rawCursorCoordsRef = useRef({ x: 0, y: 0 });
  const smoothedCursorCoordsRef = useRef({ x: 0, y: 0 });

  // Refs for tracking state inside Three.js effect without trigger unmounts
  const pickedCardIdsRef = useRef(pickedCardIds);
  useEffect(() => { pickedCardIdsRef.current = pickedCardIds; }, [pickedCardIds]);

  const isGameActiveRef = useRef(isGameActive);
  useEffect(() => { isGameActiveRef.current = isGameActive; }, [isGameActive]);

  const isCameraActiveRef = useRef(isCameraActive);
  useEffect(() => { isCameraActiveRef.current = isCameraActive; }, [isCameraActive]);

  const spreadCountRef = useRef(spreadCount);
  useEffect(() => { spreadCountRef.current = spreadCount; }, [spreadCount]);

  const isPickingCardRef = useRef(isPickingCard);
  useEffect(() => { isPickingCardRef.current = isPickingCard; }, [isPickingCard]);

  // 3D CARD INSPECTOR STATE
  const [inspectCard, setInspectCard] = useState(null);
  const [rotY, setRotY] = useState(0);
  const [isAutoRotate, setIsAutoRotate] = useState(true);

  // Random Star elements for White Cosmic Theme (from D:\bản đồ sao\fairy tale lenormand\Star_img\rm_bg)
  const randomStars = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      src: STAR_IMAGES[i % STAR_IMAGES.length],
      top: `${Math.random() * 95}%`,
      left: `${Math.random() * 95}%`,
      size: `${Math.floor(Math.random() * 32) + 18}px`,
      opacity: (Math.random() * 0.75 + 0.25).toFixed(2),
      rotation: `${Math.floor(Math.random() * 360)}deg`,
      duration: `${(Math.random() * 4 + 3).toFixed(1)}s`
    }));
  }, []);

  // Shuffled deck
  const [shuffledDeck, setShuffledDeck] = useState([]);

  useEffect(() => {
    const list = [...cardsData];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    setShuffledDeck(list);
  }, [step, cardsData]);

  // MEDIAPIPE HANDS INITIALIZATION & WEBCAM STREAM
  useEffect(() => {
    if (step !== 'picking' || !isCameraActive || !videoRef.current || !isGameActive) {
      setHandDetected(false);
      return;
    }

    let isSubscribed = true;

    const initMediaPipe = async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');

        if (!isSubscribed || !window.Hands || !window.Camera) return;

        const hands = new window.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.65,
          minTrackingConfidence: 0.65
        });

        let lastPinchState = false;

        hands.onResults((results) => {
          if (!isSubscribed || !isGameActive || !isCameraActive) return;

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            setHandDetected(true);
            const landmarks = results.multiHandLandmarks[0];

            // Index Finger Tip (Landmark 8) & Thumb Tip (Landmark 4)
            const indexTip = landmarks[8];
            const thumbTip = landmarks[4];
            const handCenter = landmarks[9];

            const screenX = (1 - indexTip.x) * window.innerWidth;
            const screenY = indexTip.y * window.innerHeight;

            rawCursorCoordsRef.current = { x: screenX, y: screenY };

            // Pinch Gesture Detection: Distance between Landmark 8 and Landmark 4 < 0.08
            const dx = thumbTip.x - indexTip.x;
            const dy = thumbTip.y - indexTip.y;
            const dz = (thumbTip.z || 0) - (indexTip.z || 0);
            const pinchDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            const isPinching = pinchDistance < 0.08;
            isPinchingRef.current = isPinching;

            // Trigger pinch click once when pinch starts
            if (isPinching && !lastPinchState) {
              handPinchTriggerRef.current = true;
            }
            lastPinchState = isPinching;

            // Hand Position Left / Right to Accelerate Rotation
            const handX = 1 - handCenter.x;
            if (handX < 0.30) {
              handSpeedRef.current = -0.007; // Rotate left
              setHandDirection('left');
            } else if (handX > 0.70) {
              handSpeedRef.current = 0.007;  // Rotate right
              setHandDirection('right');
            } else {
              handSpeedRef.current = 0.0015; // Gentle rotation
              setHandDirection('center');
            }
          } else {
            setHandDetected(false);
            isPinchingRef.current = false;
            handSpeedRef.current = 0.0015;
            setHandDirection('center');
          }
        });

        const cameraInstance = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && videoRef.current.readyState >= 2 && isSubscribed && isGameActive && isCameraActive) {
              try {
                await hands.send({ image: videoRef.current });
              } catch (e) {
                // Ignore transient frame errors
              }
            }
          },
          width: 640,
          height: 480
        });

        await cameraInstance.start();
        if (isSubscribed) {
          mediaPipeCameraRef.current = cameraInstance;
        } else {
          try { cameraInstance.stop(); } catch (e) {}
        }
      } catch (err) {
        console.error("Failed to load MediaPipe Hands:", err);
      }
    };

    initMediaPipe();

    return () => {
      isSubscribed = false;
      setHandDetected(false);
      isPinchingRef.current = false;
      if (mediaPipeCameraRef.current) {
        try {
          mediaPipeCameraRef.current.stop();
        } catch (e) {}
        mediaPipeCameraRef.current = null;
      }
      if (videoRef.current && videoRef.current.srcObject) {
        try {
          const tracks = videoRef.current.srcObject.getTracks();
          tracks.forEach(track => track.stop());
        } catch (e) {}
        videoRef.current.srcObject = null;
      }
    };
  }, [step, isCameraActive, isGameActive]);

  // THREE.JS FULLSCREEN CANVAS INITIALIZATION
  useEffect(() => {
    if (step !== 'picking' || !mountRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 150);
    camera.position.set(0, 0, 16.5);
    cameraRef.current = camera;

    // 3. Renderer with Transparent Alpha Clear Color
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Handle Window Resize
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xd4af37, 3.0);
    spotLight.position.set(0, 20, 20);
    scene.add(spotLight);

    // 5. Star Particle Field in 3D Space
    const textureLoader = new THREE.TextureLoader();
    const particleTexture = generateParticleTexture();

    const starCount = 1000;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = [];
    const starSizes = [];

    for (let i = 0; i < starCount; i++) {
      starPositions.push(
        (Math.random() - 0.5) * 140,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 90 - 10
      );
      starSizes.push(Math.random() * 0.5 + 0.1);
    }

    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    starGeo.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));

    const starMat = new THREE.PointsMaterial({
      size: 0.75,
      map: particleTexture,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0xffffff
    });

    const starFieldMesh = new THREE.Points(starGeo, starMat);
    scene.add(starFieldMesh);

    // 6. Create 3D Cylinder Ring Card Deck
    const cardGroup = new THREE.Group();
    scene.add(cardGroup);
    cardGroupRef.current = cardGroup;

    const deckCount = 20;
    const radius = 16.5;
    const cardWidth = 2.85;
    const cardHeight = 4.82;
    const cardCornerRadius = 0.4;

    // Geometry bo góc như CSS border-radius (3 material group: 0=+Z trước, 1=-Z sau, 2=cạnh)
    const geo = createRoundedCardGeometry(cardWidth, cardHeight, cardCornerRadius, 0.05);

    const backTex = textureLoader.load(CARD_BACK_IMAGE);
    const sideMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.2 });

    const cardMeshes = [];

    for (let i = 0; i < deckCount; i++) {
      const cardData = shuffledDeck[i] || cardsData[i % cardsData.length];
      const frontTex = textureLoader.load(getCardFrontImg(cardData.id));

      const matFront = new THREE.MeshStandardMaterial({ map: frontTex, roughness: 0.35 });
      const matBack = new THREE.MeshStandardMaterial({ map: backTex, roughness: 0.35 });

      // Material groups: [0]=+Z mặt trước, [1]=-Z mặt sau, [2]=cạnh vàng
      // Unpicked cards in ring have matBack on BOTH sides (no card_pro illustration assigned yet)
      const materials = [matBack, matBack, sideMat];
      const card = new THREE.Mesh(geo, materials);

      const angle = (i / deckCount) * Math.PI * 2;
      const posX = Math.sin(angle) * radius;
      const posZ = Math.cos(angle) * radius;
      const posY = 0;

      card.position.set(posX, posY, posZ);
      card.lookAt(0, 0, 0);

      card.userData = {
        id: i,
        cardData,
        basePos: { x: posX, y: posY, z: posZ },
        baseRot: { x: card.rotation.x, y: card.rotation.y, z: card.rotation.z },
        isPicked: false
      };

      cardGroup.add(card);
      cardMeshes.push(card);
    }

    // Helper to retrieve main parent card mesh safely from child frontMesh/backMesh
    const getParentCard = (obj) => {
      let curr = obj;
      while (curr && curr.parent && curr.parent !== cardGroup && curr.parent !== scene) {
        curr = curr.parent;
      }
      return (curr === scene || curr === cardGroup) ? null : curr;
    };

    // Card Selection Logic (pickCard - Tarotcuabin Effect)
    let activeHoverTween = null;

    const selectCardMesh = (hitInput) => {
      const hit = getParentCard(hitInput);
      if (!hit || !hit.userData || hit.userData.isPicked || pickedCardIdsRef.current.length >= spreadCountRef.current || isPickingCardRef.current) return;

      hit.userData.isPicked = true;
      isPickingCardRef.current = true;
      setIsPickingCard(true);

      // Stop any active hover tween on this card so position doesn't conflict
      if (activeHoverTween) {
        activeHoverTween.stop();
        activeHoverTween = null;
      }
      if (hoveredCard === hit) {
        hoveredCard = null;
      }

      // Detach card from rotating ring group into scene world space
      scene.attach(hit);
      hit.renderOrder = 9999;
      hit.rotation.setFromQuaternion(hit.quaternion);

      // [DEBUG PICK] Log trạng thái ngay sau khi tách card khỏi vòng tròn
      const dbgWorldPos = new THREE.Vector3();
      hit.getWorldPosition(dbgWorldPos);
      console.log('[DEBUG PICK] After scene.attach => worldPos:', dbgWorldPos.toArray(),
        '| localPos:', hit.position.toArray(),
        '| camera:', camera.position.toArray(),
        '| cardData:', hit.userData.cardData ? '#' + hit.userData.cardData.id : '?' );

      // Dynamic flip: card flies to CENTER, zooms up big for a few seconds, then is removed
      // from the 3D ring and only shown inside the Ma Trận Bài panel (top-left) instead.
      let animStarted = false;
      const beginPickAnimation = () => {
        if (animStarted) return;
        animStarted = true;
        clearTimeout(textureTimeout);

        // [DEBUG PICK] Vị trí bắt đầu và target giữa màn hình
        console.log('[DEBUG PICK] beginPickAnimation => start:', hit.position.toArray(),
          '| TARGET center:', [0, 0, 11.5]);

        // Phase 1: Fly to CENTER screen & ZOOM IN BIG (scale 1.05 => ~88% screen height).
        // Rotate 4 full spins (y = -8*PI) landing at y ≡ 0 so the FRONT face faces the camera.
        createTween(hit.position)
          .to({ x: 0, y: 0, z: 11.5 }, 1000)
          .easing(TWEEN.Easing.Cubic.Out)
          .start();

        createTween(hit.rotation)
          .to({ x: 0, y: -Math.PI * 8, z: 0 }, 1200)
          .easing(TWEEN.Easing.Cubic.InOut)
          .onComplete(() => {
            // Khóa card quay thẳng về camera (mặt +Z hướng về người xem) để chắc chắn
            // mặt TRƯỚC hiện ra, không bị "ngược mặt".
            hit.rotation.set(0, 0, 0);
            const facing = new THREE.Vector3(0, 0, 1).applyQuaternion(hit.quaternion);
            console.log('[DEBUG PICK] Rotation COMPLETE => card +Z faces:', facing.toArray(),
              '| (0,0,1) = đúng hướng camera, (0,0,-1) = ngược');
          })
          .start();

        createTween(hit.scale)
          .to({ x: 1.05, y: 1.05, z: 1.05 }, 1000)
          .easing(TWEEN.Easing.Cubic.Out)
          .onComplete(() => {
            // Phase 2: Hold the zoomed card for ~2s, then shrink it away & remove it from the
            // 3D scene — the flipped card now only appears in the Ma Trận Bài panel.
            setTimeout(() => {
              createTween(hit.scale)
                .to({ x: 0.01, y: 0.01, z: 0.01 }, 400)
                .easing(TWEEN.Easing.Cubic.In)
                .onComplete(() => {
                  scene.remove(hit);
                  hit.material.forEach((m) => { m.depthTest = true; m.depthWrite = true; });
                  isPickingCardRef.current = false;
                  setIsPickingCard(false);

                  setPickedCardIds(prev => {
                    const next = [...prev, hit.userData.cardData];
                    if (next.length === spreadCountRef.current) {
                      setIsGameActive(false);
                      setTimeout(() => setStep('result'), 800);
                    }
                    return next;
                  });
                })
                .start();
            }, 2000);
          })
          .start();
      };

      // Helper: apply the front artwork and force the card to render ON TOP of the rotating
      // ring (depthTest OFF + highest renderOrder) so the zoomed card always stands straight
      // in front of the viewer, never hidden behind nearer ring cards.
      const applyPickMaterial = (mapTex) => {
        const matFront = new THREE.MeshStandardMaterial({ map: mapTex, roughness: 0.35 });
        hit.material[0] = matFront; // group 0 = mặt +Z hướng về camera
        hit.material.forEach((m) => { m.depthTest = false; m.depthWrite = false; });
        hit.materialNeedsUpdate = true;
        console.log('[DEBUG PICK] applyPickMaterial => card #', hit.userData.cardData?.id,
          '| texture.image:', mapTex.image ? (mapTex.image.src || mapTex.image.currentSrc || 'loaded') : 'NULL');
      };

      // Load the card_pro front illustration FIRST, then run the animation once the image is
      // ready (prevents the centered card from showing a blank/black front face)
      const frontUrl = getCardFrontImg(hit.userData.cardData.id);
      console.log('[DEBUG PICK] loading front URL:', frontUrl);
      const frontTex = textureLoader.load(
        frontUrl,
        () => {
          console.log('[DEBUG PICK] onLoad FIRED (front texture loaded OK)');
          applyPickMaterial(frontTex);
          beginPickAnimation();
        },
        undefined,
        () => {
          console.log('[DEBUG PICK] onError FIRED (front texture FAILED -> apply BACK)');
          applyPickMaterial(backTex);
          beginPickAnimation();
        }
      );

      // Safety fallback: run the animation even if texture loading is slow / hangs
      const textureTimeout = setTimeout(() => {
        console.log('[DEBUG PICK] textureTimeout FIRED (700ms fallback)');
        applyPickMaterial(frontTex);
        beginPickAnimation();
      }, 700);
    };

    // 8. Raycasting & Drag Rotation Handlers
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isMouseDown = false;
    let previousMouseX = 0;
    let hoveredCard = null;

    const onMouseDown = (e) => {
      if (!isGameActiveRef.current) return;
      isMouseDown = true;
      previousMouseX = e.clientX;
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    const onMouseMove = (e) => {
      if (!isGameActiveRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isMouseDown) {
        const deltaX = e.clientX - previousMouseX;
        cardGroup.rotation.y += deltaX * 0.0035;
        previousMouseX = e.clientX;
      }
    };

    const onClick = (e) => {
      if (!isGameActiveRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cardMeshes, true);

      if (intersects.length > 0) {
        const hit = getParentCard(intersects[0].object);
        if (hit) {
          selectCardMesh(hit);
        }
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    domElem.addEventListener('mousemove', onMouseMove);
    domElem.addEventListener('click', onClick);

    // 9. Render & Animation Loop
    let animFrameId;
    const tempWorldPos = new THREE.Vector3();

    const animate = (time) => {
      animFrameId = requestAnimationFrame(animate);

      if (!isMouseDown) {
        cardGroup.rotation.y += handSpeedRef.current;
      }
      starFieldMesh.rotation.y += 0.0005;

      // Dynamic Card Scaling: Các lá ở phía giữa to hơn 1 tí (base scale 1.22 ở trung tâm).
      // Chỉ tác động lên các lá CÒN TRONG vòng tròn (cardGroup.children) — lá đã pick bị
      // scene.attach ra ngoài nên tự động loại khỏi danh sách này => KHÔNG bao giờ bị ghi đè
      // vị trí/scale, giúp lá tách hẳn khỏi hiệu ứng tổng (đúng kỹ thuật tarotcuabin).
      cardGroup.children.forEach((card) => {
        if (card.userData && card.userData.basePos) {
          card.getWorldPosition(tempWorldPos);
          const distFromCenter = Math.min(Math.abs(tempWorldPos.x) / 11.5, 1.0);
          
          const centerBaseScale = 1.22;
          const sideScale = centerBaseScale + Math.pow(distFromCenter, 1.2) * 0.38;

          if (card === hoveredCard) {
            const hScale = sideScale * 1.15;
            card.scale.set(hScale, hScale, hScale);
          } else {
            card.scale.set(sideScale, sideScale, sideScale);
          }
        }
      });

      // Cursor Smooth LERP Factor = 0.10
      if (isGameActiveRef.current && isCameraActiveRef.current && rawCursorCoordsRef.current.x > 0 && rawCursorCoordsRef.current.y > 0) {
        const targetX = rawCursorCoordsRef.current.x;
        const targetY = rawCursorCoordsRef.current.y;

        if (smoothedCursorCoordsRef.current.x === 0 && smoothedCursorCoordsRef.current.y === 0) {
          smoothedCursorCoordsRef.current.x = targetX;
          smoothedCursorCoordsRef.current.y = targetY;
        } else {
          smoothedCursorCoordsRef.current.x += (targetX - smoothedCursorCoordsRef.current.x) * 0.10;
          smoothedCursorCoordsRef.current.y += (targetY - smoothedCursorCoordsRef.current.y) * 0.10;
        }

        const currX = smoothedCursorCoordsRef.current.x;
        const currY = smoothedCursorCoordsRef.current.y;

        setHandCursor({ x: currX, y: currY, isPinching: isPinchingRef.current });

        // Raycaster từ con trỏ ảo
        const rect = renderer.domElement.getBoundingClientRect();
        const cursorNormX = ((currX - rect.left) / rect.width) * 2 - 1;
        const cursorNormY = -((currY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(new THREE.Vector2(cursorNormX, cursorNormY), camera);
        const intersects = raycaster.intersectObjects(cardMeshes, true);

        if (intersects.length > 0) {
          const hit = getParentCard(intersects[0].object);
          if (hit && hit.userData && hit.userData.basePos && !hit.userData.isPicked) {
            if (hoveredCard !== hit) {
              if (hoveredCard && hoveredCard.userData && hoveredCard.userData.basePos && !hoveredCard.userData.isPicked) {
                if (activeHoverTween) activeHoverTween.stop();
                activeHoverTween = createTween(hoveredCard.position)
                  .to(hoveredCard.userData.basePos, 200)
                  .start();
              }
              hoveredCard = hit;
              const targetElevated = {
                x: hit.userData.basePos.x * 1.08,
                y: hit.userData.basePos.y + 0.8,
                z: hit.userData.basePos.z * 1.08
              };
              if (activeHoverTween) activeHoverTween.stop();
              activeHoverTween = createTween(hit.position).to(targetElevated, 250).start();
            }

            // Trigger Pinch Selection if Pinch Gesture occurs
            if (handPinchTriggerRef.current) {
              selectCardMesh(hit);
              handPinchTriggerRef.current = false;
            }
          }
        } else {
          if (hoveredCard && hoveredCard.userData && hoveredCard.userData.basePos && !hoveredCard.userData.isPicked) {
            if (activeHoverTween) activeHoverTween.stop();
            activeHoverTween = createTween(hoveredCard.position)
              .to(hoveredCard.userData.basePos, 200)
              .start();
            hoveredCard = null;
          }
        }
      }

      handPinchTriggerRef.current = false;

      // Vertical Up/Down Floating (chỉ cho các lá còn trong vòng tròn)
      const floatTime = time * 0.00085;
      cardGroup.children.forEach((card) => {
        if (card.userData && card.userData.basePos && card !== hoveredCard) {
          const floatY = Math.sin(floatTime + card.userData.id * 0.32) * 0.85;
          card.position.y = card.userData.basePos.y + floatY;
        }
      });

      TWEEN.update(performance.now());

      renderer.render(scene, camera);
    };
    animate();

    // Clean up
    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      domElem.removeEventListener('mousemove', onMouseMove);
      domElem.removeEventListener('click', onClick);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [step, shuffledDeck]);

  // TOGGLE WEBCAM CAMERA MODE
  const toggleCamera = () => {
    setIsCameraActive(prev => !prev);
  };

  // AUTO ROTATE 3D INSPECTOR
  useEffect(() => {
    let animId;
    if (inspectCard && isAutoRotate) {
      const updateRotation = () => {
        setRotY(prev => (prev + 1.2) % 360);
        animId = requestAnimationFrame(updateRotation);
      };
      animId = requestAnimationFrame(updateRotation);
    }
    return () => cancelAnimationFrame(animId);
  }, [inspectCard, isAutoRotate]);

  const handleStartReading = () => {
    setPickedCardIds([]);
    setIsGameActive(true);
    setStep('picking');
  };

  const handleReset = () => {
    setPickedCardIds([]);
    setIsGameActive(true);
    setStep('setup');
  };

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: 'radial-gradient(circle at 50% 20%, #FFFFFF 0%, #F5F3FF 45%, #EEF2FF 80%, #E0E7FF 100%)',
      color: '#1E1B4B',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      paddingBottom: step === 'picking' ? 0 : '60px'
    }}>

      {/* HIDDEN INVISIBLE WEBCAM VIDEO ELEMENT */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1,
          visibility: 'hidden'
        }}
      />

      {/* VIRTUAL HAND CURSOR */}
      {step === 'picking' && isGameActive && isCameraActive && handDetected && handCursor.x > 0 && (
        <div style={{
          position: 'fixed',
          top: handCursor.y,
          left: handCursor.x,
          transform: 'translate(-50%, -50%)',
          zIndex: 200,
          pointerEvents: 'none',
          transition: 'transform 0.05s ease-out'
        }}>
          {/* Virtual Glowing Cursor Ring */}
          <div style={{
            width: handCursor.isPinching ? '22px' : '36px',
            height: handCursor.isPinching ? '22px' : '36px',
            borderRadius: '50%',
            border: handCursor.isPinching ? '3px solid #FFFFFF' : '2.5px solid #9333EA',
            background: handCursor.isPinching ? 'radial-gradient(circle, #F59E0B 0%, #D97706 100%)' : 'rgba(147, 51, 234, 0.2)',
            boxShadow: handCursor.isPinching 
              ? '0 0 30px #F59E0B, 0 0 50px #F59E0B, 0 0 75px #FFFFFF' 
              : '0 0 15px rgba(147, 51, 234, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: handCursor.isPinching ? 'scale(0.9)' : 'scale(1)'
          }}>
            <div style={{
              width: handCursor.isPinching ? '6px' : '10px',
              height: handCursor.isPinching ? '6px' : '10px',
              borderRadius: '50%',
              background: '#FFFFFF',
              boxShadow: handCursor.isPinching ? '0 0 10px #FFFFFF' : 'none'
            }} />
          </div>

          {/* Pinch text indicator */}
          {handCursor.isPinching && (
            <div style={{
              position: 'absolute',
              top: '-26px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#F59E0B',
              color: '#FFFFFF',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '10px',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.6)'
            }}>
              👌 PINCH CHỌN BÀI!
            </div>
          )}
        </div>
      )}

      {/* Floating Random Stars Layer (Star_img/rm_bg) placed BEHIND 3D Cards canvas (zIndex: 2) */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
        {randomStars.map((star) => (
          <img
            key={star.id}
            src={star.src}
            alt="Star element"
            style={{
              position: 'absolute',
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              transform: `rotate(${star.rotation})`,
              filter: 'drop-shadow(0 0 12px rgba(147, 51, 234, 0.5))',
              animation: `floatSlow ${star.duration} ease-in-out infinite alternate`
            }}
          />
        ))}
      </div>

      {/* Navigation Top Bar (Only visible in Setup or Result mode) */}
      {step !== 'picking' && (
        <div style={{
          position: 'relative',
          zIndex: 10,
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(147, 51, 234, 0.15)',
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)'
        }}>
          <button
            onClick={onBackToHome}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: '#FFFFFF',
              border: '1.5px solid #9333EA',
              borderRadius: '30px',
              color: '#6B21A8',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(147, 51, 234, 0.12)',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft size={16} />
            Trở về Trang Chủ
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #9333EA 0%, #4F46E5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)'
            }}>
              <Sparkles size={18} />
            </div>
            <h1 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.6rem',
              fontWeight: 700,
              color: '#4C1D95',
              margin: 0
            }}>
              Trải Bài Vũ Trụ (MediaPipe Pinch 👌)
            </h1>
          </div>

          {/* TOGGLE CAMERA BUTTON IN NAV BAR */}
          <button
            onClick={toggleCamera}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              background: isCameraActive ? 'linear-gradient(135deg, #9333EA 0%, #6B21A8 100%)' : '#FFFFFF',
              border: '1.5px solid #9333EA',
              borderRadius: '30px',
              color: isCameraActive ? '#FFFFFF' : '#6B21A8',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(147, 51, 234, 0.2)',
              transition: 'all 0.2s ease'
            }}
          >
            {isCameraActive ? <CameraOff size={16} /> : <CameraIcon size={16} />}
            {isCameraActive ? '📷 Tắt Camera AI Bàn Tay' : '📷 Bật Camera AI Bàn Tay'}
          </button>
        </div>
      )}

      {/* TOP-LEFT SMALL CARD MATRIX */}
      {(step === 'picking' || step === 'result') && (
        <div style={{
          position: 'fixed',
          top: '25px',
          left: '25px',
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '2.5px solid #9333EA',
          borderRadius: '20px',
          padding: '12px 16px',
          boxShadow: '0 10px 30px rgba(147, 51, 234, 0.25), 0 0 25px rgba(255, 255, 255, 0.9)',
          maxWidth: spreadCount === 9 ? '240px' : spreadCount === 3 ? '220px' : '110px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '0.78rem',
            fontWeight: 800,
            color: '#581C87',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            <span>Ma Trận Bài</span>
            <span style={{
              background: 'linear-gradient(135deg, #9333EA 0%, #6B21A8 100%)',
              padding: '2px 8px',
              borderRadius: '10px',
              color: '#FFFFFF',
              fontWeight: 800
            }}>
              {pickedCardIds.length}/{spreadCount}
            </span>
          </div>

          {/* Matrix Slots Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: spreadCount === 9 ? 'repeat(3, 1fr)' : spreadCount === 3 ? 'repeat(3, 1fr)' : '1fr',
            gap: '8px'
          }}>
            {Array.from({ length: spreadCount }).map((_, idx) => {
              const card = pickedCardIds[idx];
              return (
                <div
                  key={idx}
                  onClick={() => card && setInspectCard(card)}
                  style={{
                    width: spreadCount === 9 ? '56px' : spreadCount === 3 ? '56px' : '75px',
                    height: spreadCount === 9 ? '82px' : spreadCount === 3 ? '82px' : '110px',
                    borderRadius: '12px',
                    border: card ? '2px solid #9333EA' : '2px dashed rgba(147, 51, 234, 0.4)',
                    background: card ? '#0F0C20' : 'rgba(243, 232, 255, 0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: card ? 'pointer' : 'default',
                    boxShadow: card ? '0 4px 12px rgba(147, 51, 234, 0.35)' : 'none'
                  }}
                >
                  {card ? (
                    <img
                      src={getCardFrontImg(card.id)}
                      alt={card.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = CARD_BACK_IMAGE;
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: '#9333EA', fontWeight: 800 }}>
                      #{idx + 1}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TOP-RIGHT ELEGANT COUNTER BADGE */}
      {step === 'picking' && (
        <div style={{
          position: 'fixed',
          top: '25px',
          right: '30px',
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          border: '1.5px solid #9333EA',
          padding: '8px 22px',
          borderRadius: '30px',
          fontSize: '1.1rem',
          fontWeight: 800,
          color: '#4C1D95',
          boxShadow: '0 8px 20px rgba(147, 51, 234, 0.2)',
          letterSpacing: '2px'
        }}>
          {pickedCardIds.length} / {spreadCount}
        </div>
      )}

      {/* TOP-RIGHT ACTION OVERLAY BUTTONS IN PICKING MODE */}
      {step === 'picking' && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '30px',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          alignItems: 'flex-end'
        }}>
          <button
            onClick={onBackToHome}
            style={{
              padding: '8px 16px',
              background: '#FFFFFF',
              border: '1.5px solid #9333EA',
              borderRadius: '30px',
              color: '#6B21A8',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(147, 51, 234, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={14} /> Trở về
          </button>

          {/* TOGGLE CAMERA BUTTON */}
          <button
            onClick={toggleCamera}
            style={{
              padding: '8px 18px',
              background: isCameraActive ? 'linear-gradient(135deg, #9333EA 0%, #6B21A8 100%)' : '#FFFFFF',
              border: '1.5px solid #9333EA',
              borderRadius: '30px',
              color: isCameraActive ? '#FFFFFF' : '#6B21A8',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(147, 51, 234, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            {isCameraActive ? <CameraOff size={14} /> : <CameraIcon size={14} />}
            {isCameraActive ? '📷 Tắt Camera AI Bàn Tay' : '📷 Bật Camera AI Bàn Tay'}
          </button>
        </div>
      )}

      {/* BOTTOM CENTER GUIDANCE TEXT */}
      {step === 'picking' && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          color: '#581C87',
          letterSpacing: '1px',
          fontWeight: 800,
          fontSize: '0.82rem',
          textShadow: '0 0 10px rgba(255, 255, 255, 0.9), 0 0 20px rgba(147, 51, 234, 0.3)',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          padding: '10px 26px',
          borderRadius: '24px',
          border: '1.5px solid rgba(147, 51, 234, 0.4)',
          pointerEvents: 'none',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(147, 51, 234, 0.2)'
        }}>
          {isCameraActive ? (
            '✋ CHỤM NGÓN CÁI + TRỎ (KHOẢNG CÁCH < 0.08 👌) ĐỂ CHỌN BÀI • ĐƯA TAY SANG TRÁI/PHẢI ĐỂ XOAY VÒNG BÀI'
          ) : (
            '🖱 KHÔNG DÙNG CAMERA: CLICK MỚI LÁ BÀI BẰNG CHUỘT HOẶC KÉO TRÁI/PHẢI ĐỂ XOAY VÒNG BÀI'
          )}
        </div>
      )}

      {/* STEP 2: THREE.JS FULLSCREEN 100VW x 100VH 3D CANVAS */}
      {step === 'picking' && (
        <div
          ref={mountRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 5,
            overflow: 'hidden',
            cursor: 'grab'
          }}
        />
      )}

      {/* MAIN CONTENT AREA FOR SETUP & RESULT */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1150px', margin: '0 auto', padding: step === 'picking' ? 0 : '30px 20px' }}>

        {/* STEP 1: QUESTION & SPREAD SELECTION (1 LÁ, 3 LÁ, 9 LÁ) */}
        {step === 'setup' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '28px',
            border: '2px solid rgba(147, 51, 234, 0.3)',
            padding: '44px 36px',
            boxShadow: '0 20px 50px rgba(147, 51, 234, 0.15)',
            textAlign: 'center',
            animation: 'fadeInScale 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{
              display: 'inline-flex',
              padding: '6px 18px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #F3E8FF 0%, #E0E7FF 100%)',
              color: '#6B21A8',
              fontWeight: 800,
              fontSize: '0.88rem',
              marginBottom: '18px',
              gap: '6px',
              alignItems: 'center'
            }}>
              <Sparkles size={16} />
              BỐC BÀI VŨ TRỤ MEDIA-PIPE HAND TRACKING (3D TAROTCUABIN REPO ENGINE)
            </div>

            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '2.7rem',
              color: '#3B0764',
              margin: '0 0 12px 0',
              fontWeight: 700
            }}>
              Tập Trung Tâm Trí & Đặt Câu Hỏi
            </h2>
            <p style={{ color: '#6B21A8', maxWidth: '680px', margin: '0 auto 34px auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Nhập ý niệm của bạn, chọn loại quẻ (1 lá, 3 lá hoặc 9 lá ma trận), sau đó điều khiển bằng bàn tay trước Camera (Chụm ngón tay 👌 chọn bài) hoặc dùng chuột như dự phòng!
            </p>

            {/* Question Input Box */}
            <div style={{ maxWidth: '700px', margin: '0 auto 30px auto' }}>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Nhập câu hỏi của bạn (ví dụ: Định hướng công việc sắp tới của tôi sẽ ra sao?)..."
                style={{
                  width: '100%',
                  padding: '18px 24px',
                  borderRadius: '18px',
                  border: '2px solid #A855F7',
                  background: '#FFFFFF',
                  color: '#1E1B4B',
                  fontSize: '1.08rem',
                  outline: 'none',
                  boxShadow: '0 6px 22px rgba(168, 85, 247, 0.14)',
                  boxSizing: 'border-box'
                }}
              />

              {/* Sample Suggestions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '14px' }}>
                {['Tình duyên & Mối quan hệ', 'Sự nghiệp & Tài chính', 'Lời khuyên ngày mới', 'Thông điệp tổng quan'].map((txt) => (
                  <button
                    key={txt}
                    onClick={() => setQuestion(txt)}
                    style={{
                      padding: '7px 16px',
                      borderRadius: '20px',
                      border: '1px solid rgba(168, 85, 247, 0.4)',
                      background: question === txt ? '#9333EA' : 'rgba(255, 255, 255, 0.85)',
                      color: question === txt ? '#FFFFFF' : '#6B21A8',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    + {txt}
                  </button>
                ))}
              </div>
            </div>

            {/* Spread Count Options (1 Lá, 3 Lá, 9 Lá) */}
            <div style={{ marginBottom: '38px' }}>
              <label style={{ display: 'block', fontWeight: 800, color: '#4C1D95', marginBottom: '18px', fontSize: '1.15rem' }}>
                Chọn Loại Quẻ Ma Trận Bài:
              </label>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                gap: '22px',
                maxWidth: '850px',
                margin: '0 auto'
              }}>
                {[
                  { count: 1, name: '1 Lá Bài', desc: 'Thông điệp vũ trụ tức thời, câu trả lời nhanh' },
                  { count: 3, name: '3 Lá Bài', desc: 'Quá Khứ • Hiện Tại • Tương Lai (Phổ biến)' },
                  { count: 9, name: '9 Lá Bài (Matrix)', desc: 'Ma trận Grand Spread 3x3 toàn diện' }
                ].map((item) => (
                  <div
                    key={item.count}
                    onClick={() => setSpreadCount(item.count)}
                    style={{
                      padding: '24px 20px',
                      borderRadius: '22px',
                      border: spreadCount === item.count ? '3.5px solid #9333EA' : '2px solid rgba(168, 85, 247, 0.25)',
                      background: spreadCount === item.count ? 'linear-gradient(135deg, #F3E8FF 0%, #FFFFFF 100%)' : '#FFFFFF',
                      boxShadow: spreadCount === item.count ? '0 12px 28px rgba(147, 51, 234, 0.28)' : '0 4px 12px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      transform: spreadCount === item.count ? 'translateY(-4px)' : 'none',
                      transition: 'all 0.25s ease',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{
                      fontSize: '2.1rem',
                      fontFamily: 'Cormorant Garamond, serif',
                      fontWeight: 800,
                      color: '#6B21A8',
                      marginBottom: '6px'
                    }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#581C87', lineHeight: 1.4 }}>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartReading}
              style={{
                padding: '18px 46px',
                borderRadius: '50px',
                background: 'linear-gradient(135deg, #7E22CE 0%, #4F46E5 100%)',
                color: '#FFFFFF',
                fontSize: '1.2rem',
                fontWeight: 800,
                border: '2px solid #E9D5FF',
                cursor: 'pointer',
                boxShadow: '0 12px 35px rgba(126, 34, 206, 0.45)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Wand2 size={24} />
              Bắt Đầu Bốc Bài MediaPipe AI Bàn Tay
            </button>
          </div>
        )}

        {/* STEP 3: RESULT & LỜI TIÊN TRI MODAL */}
        {step === 'result' && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: '38px' }}>
              <div style={{
                display: 'inline-flex',
                padding: '6px 20px',
                borderRadius: '20px',
                background: '#F3E8FF',
                color: '#7E22CE',
                fontWeight: 800,
                fontSize: '0.9rem',
                marginBottom: '14px'
              }}>
                ✨ MODAL LỜI TIÊN TRI VŨ TRỤ 3D
              </div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.6rem', color: '#3B0764', margin: '0 0 8px 0' }}>
                {question ? `"${question}"` : 'Lời Tiên Tri Vũ Trụ'}
              </h2>
              <p style={{ color: '#6B21A8', fontSize: '1rem' }}>
                Nhấn vào lá bài để xoay 3D 360° và xem cận cảnh chi tiết!
              </p>
            </div>

            {/* Cards Result Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: spreadCount === 9 ? 'repeat(auto-fit, minmax(290px, 1fr))' : 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '30px',
              marginBottom: '44px'
            }}>
              {pickedCardIds.map((card, idx) => (
                <div
                  key={card.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.94)',
                    backdropFilter: 'blur(18px)',
                    WebkitBackdropFilter: 'blur(18px)',
                    borderRadius: '26px',
                    border: '2px solid #9333EA',
                    padding: '26px',
                    boxShadow: '0 14px 40px rgba(147, 51, 234, 0.18)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    animation: 'fadeInScale 0.4s ease-out forwards',
                    animationDelay: `${idx * 0.15}s`
                  }}
                >
                  {/* Card Front Image Showcase */}
                  <div
                    onClick={() => setInspectCard(card)}
                    style={{
                      width: '190px',
                      height: '285px',
                      borderRadius: '18px',
                      overflow: 'hidden',
                      border: '3px solid #9333EA',
                      boxShadow: '0 12px 28px rgba(147, 51, 234, 0.35)',
                      marginBottom: '20px',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img
                      src={getCardFrontImg(card.id)}
                      alt={card.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = CARD_BACK_IMAGE;
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      insetInline: 0,
                      background: 'rgba(15, 12, 32, 0.88)',
                      color: '#F4E7B2',
                      fontSize: '0.75rem',
                      padding: '5px',
                      textAlign: 'center',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}>
                      <Move3d size={14} /> Click Xoay 3D 360°
                    </div>
                  </div>

                  {/* Card Title & Slot */}
                  <div style={{ textAlign: 'center', marginBottom: '16px', width: '100%' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#9333EA', textTransform: 'uppercase' }}>
                      Vị trí #{idx + 1}
                    </div>
                    <h3 style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '1.7rem',
                      color: '#4C1D95',
                      margin: '4px 0 2px 0'
                    }}>
                      #{card.id} • {card.name} ({card.vnName})
                    </h3>
                    <div style={{ fontSize: '0.88rem', color: '#6B21A8', fontWeight: 600 }}>
                      Lá bài: {card.playingCard} • Truyện: {card.fairyTale}
                    </div>
                  </div>

                  {/* KEY KEYWORDS BOX */}
                  <div style={{
                    background: 'linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%)',
                    border: '2px solid #C084FC',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    width: '100%',
                    marginBottom: '16px',
                    boxSizing: 'border-box'
                  }}>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      color: '#6B21A8',
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Sparkles size={14} />
                      Từ khóa chính (Key):
                    </div>
                    <div style={{ fontSize: '0.98rem', color: '#4C1D95', fontWeight: 700, lineHeight: 1.45 }}>
                      {card.keywords || card.summary}
                    </div>
                  </div>

                  {/* Story summary */}
                  {card.story && (
                    <div style={{
                      background: 'rgba(250, 250, 245, 0.8)',
                      borderRadius: '12px',
                      padding: '12px',
                      fontSize: '0.85rem',
                      color: '#4B5563',
                      lineHeight: 1.5,
                      marginBottom: '14px',
                      textAlign: 'justify'
                    }}>
                      <strong>Cổ tích:</strong> {card.story.substring(0, 150)}...
                    </div>
                  )}

                  {/* Detailed Interpretation */}
                  <div style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.65, textAlign: 'justify' }}>
                    {card.interpretation}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions Bar */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', flexWrap: 'wrap' }}>
              <button
                onClick={handleStartReading}
                style={{
                  padding: '15px 32px',
                  borderRadius: '30px',
                  background: '#9333EA',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 22px rgba(147, 51, 234, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <RefreshCw size={18} />
                Bốc Quẻ Mới
              </button>

              <button
                onClick={handleReset}
                style={{
                  padding: '15px 32px',
                  borderRadius: '30px',
                  background: '#FFFFFF',
                  color: '#6B21A8',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  border: '2px solid #9333EA',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
                }}
              >
                Đổi Số Lượng Lá Bài
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3D INTERACTIVE CARD INSPECTOR MODAL */}
      {inspectCard && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          background: 'rgba(5, 4, 18, 0.88)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #090A1A 0%, #150E38 50%, #1A0B2E 100%)',
            border: '2px solid #D4AF37',
            borderRadius: '24px',
            padding: '30px',
            maxWidth: '520px',
            width: '100%',
            textAlign: 'center',
            color: '#FFFFFF',
            position: 'relative',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(168, 85, 247, 0.4)'
          }}>
            <button
              onClick={() => setInspectCard(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid #D4AF37',
                color: '#F4E7B2',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              ✕
            </button>

            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.7rem', color: '#F4E7B2', margin: '0 0 6px 0' }}>
              #{inspectCard.id} • {inspectCard.name} ({inspectCard.vnName})
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#A0B4A8', margin: '0 0 22px 0' }}>
              Xoay xem bài 3D 360° mặt trước & mặt sau bài
            </p>

            {/* 3D Rotating Canvas Box */}
            <div style={{
              width: '200px',
              height: '300px',
              margin: '0 auto 24px auto',
              perspective: '1000px'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                transformStyle: 'preserve-3d',
                transform: `rotateY(${rotY}deg)`,
                transition: isAutoRotate ? 'none' : 'transform 0.2s ease-out'
              }}>
                {/* Front Face */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backfaceVisibility: 'hidden',
                  borderRadius: '16px',
                  border: '2px solid #D4AF37',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(212, 175, 55, 0.4)'
                }}>
                  <img
                    src={getCardFrontImg(inspectCard.id)}
                    alt={inspectCard.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                {/* Back Face */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  borderRadius: '16px',
                  border: '2px solid #D4AF37',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(168, 85, 247, 0.4)'
                }}>
                  <img
                    src={CARD_BACK_IMAGE}
                    alt="Back"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                <span style={{ minWidth: '70px', color: '#F4E7B2' }}>Xoay Y:</span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotY}
                  onChange={(e) => {
                    setIsAutoRotate(false);
                    setRotY(Number(e.target.value));
                  }}
                  style={{ flex: 1 }}
                />
                <span>{Math.round(rotY)}°</span>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
                <button
                  onClick={() => setIsAutoRotate(!isAutoRotate)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '20px',
                    border: '1px solid #D4AF37',
                    background: isAutoRotate ? '#D4AF37' : 'transparent',
                    color: isAutoRotate ? '#090A1A' : '#F4E7B2',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  {isAutoRotate ? 'Tạm Dừng Xoay' : 'Tự Động Xoay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
