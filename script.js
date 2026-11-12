(() => {
    "use strict";
  
    const $ = (id) => document.getElementById(id);
  
    // =====================================================
    // 1. УМУМИИ САЙТ
    // =====================================================
  
    function toast(message) {
      const el = $("toast");
      if (!el) return;
  
      el.textContent = message;
      el.classList.add("show");
  
      clearTimeout(toast.timer);
      toast.timer = setTimeout(() => el.classList.remove("show"), 2800);
    }
  
    // =====================================================
    // 2. МАВОД ВА ГЕОМЕТРИЯИ СЕАНДОЗА
    // =====================================================
  
    function makeMaterial(T, color, roughness = 0.42, metalness = 0) {
      return new T.MeshPhysicalMaterial({
        color,
        roughness,
        metalness,
        clearcoat: 0.32,
        clearcoatRoughness: 0.32
      });
    }
  
    function roundedBoxGeometry(T, width, height, depth, radius = 0.06) {
      const r = Math.max(
        0.005,
        Math.min(radius, width * 0.24, height * 0.24)
      );
  
      const bevel = Math.min(0.012, depth * 0.13, r * 0.22);
  
      const shape = new T.Shape();
  
      shape.moveTo(-width / 2 + r, -height / 2);
      shape.lineTo(width / 2 - r, -height / 2);
      shape.quadraticCurveTo(
        width / 2, -height / 2,
        width / 2, -height / 2 + r
      );
  
      shape.lineTo(width / 2, height / 2 - r);
      shape.quadraticCurveTo(
        width / 2, height / 2,
        width / 2 - r, height / 2
      );
  
      shape.lineTo(-width / 2 + r, height / 2);
      shape.quadraticCurveTo(
        -width / 2, height / 2,
        -width / 2, height / 2 - r
      );
  
      shape.lineTo(-width / 2, -height / 2 + r);
      shape.quadraticCurveTo(
        -width / 2, -height / 2,
        -width / 2 + r, -height / 2
      );
  
      const geometry = new T.ExtrudeGeometry(shape, {
        depth,
        steps: 1,
        bevelEnabled: bevel > 0.001,
        bevelSegments: 3,
        bevelSize: bevel,
        bevelThickness: bevel,
        curveSegments: 8
      });
  
      geometry.translate(0, 0, -depth / 2);
      geometry.computeVertexNormals();
  
      return geometry;
    }
  
    function addBox(
      T,
      parent,
      dimensions,
      material,
      position,
      rotation = [0, 0, 0],
      radius = 0.055
    ) {
      const mesh = new T.Mesh(
        roundedBoxGeometry(
          T,
          dimensions[0],
          dimensions[1],
          dimensions[2],
          radius
        ),
        material
      );
  
      mesh.position.set(...position);
      mesh.rotation.set(...rotation);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
  
      parent.add(mesh);
      return mesh;
    }
  
    function addSphere(T, parent, radius, material, position, scale = [1, 1, 1]) {
      const mesh = new T.Mesh(
        new T.SphereGeometry(radius, 40, 32),
        material
      );
  
      mesh.position.set(...position);
      mesh.scale.set(...scale);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
  
      parent.add(mesh);
      return mesh;
    }
  
    function addCylinder(
      T,
      parent,
      radiusTop,
      radiusBottom,
      height,
      material,
      position,
      rotation = [0, 0, 0]
    ) {
      const mesh = new T.Mesh(
        new T.CylinderGeometry(
          radiusTop,
          radiusBottom,
          height,
          32
        ),
        material
      );
  
      mesh.position.set(...position);
      mesh.rotation.set(...rotation);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
  
      parent.add(mesh);
      return mesh;
    }
  
    function addTorus(T, parent, radius, tube, material, position, rotation = [0, 0, 0]) {
      const mesh = new T.Mesh(
        new T.TorusGeometry(radius, tube, 12, 120),
        material
      );
  
      mesh.position.set(...position);
      mesh.rotation.set(...rotation);
      parent.add(mesh);
  
      return mesh;
    }
  
    // =====================================================
    // 3. ТЕКСТУРАИ СТИЛИЗАТСИЯШУДАИ ЗАМИН
    // =====================================================
  
    function createEarthTexture(T) {
      const canvas = document.createElement("canvas");
      canvas.width = 2048;
      canvas.height = 1024;
  
      const ctx = canvas.getContext("2d");
  
      const ocean = ctx.createLinearGradient(0, 0, 2048, 1024);
      ocean.addColorStop(0, "#193a42");
      ocean.addColorStop(0.45, "#406d65");
      ocean.addColorStop(1, "#172f38");
  
      ctx.fillStyle = ocean;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
  
      const continents = [
        [
          [-168,69],[-145,63],[-133,53],[-124,48],[-128,39],
          [-112,24],[-99,18],[-84,8],[-73,17],[-63,43],
          [-56,53],[-79,64],[-104,73],[-135,72]
        ],
        [
          [-80,11],[-65,7],[-51,-2],[-44,-14],[-38,-22],
          [-49,-35],[-56,-48],[-70,-55],[-77,-32]
        ],
        [
          [-53,82],[-36,78],[-21,67],[-37,59],[-54,62],[-63,73]
        ],
        [
          [-11,71],[8,72],[27,62],[38,53],[27,40],[14,34],[2,39],[-8,51]
        ],
        [
          [-17,35],[4,38],[21,31],[34,17],[42,1],[34,-17],
          [22,-35],[11,-33],[0,-17],[-9,3],[-17,15]
        ],
        [
          [29,69],[51,66],[78,57],[103,55],[128,47],[150,59],
          [170,51],[162,36],[139,25],[120,14],[105,2],[90,12],
          [74,7],[62,25],[46,32],[35,48]
        ],
        [
          [67,25],[79,9],[94,6],[105,-4],[121,-11],[140,-17],
          [129,-29],[112,-23],[98,-13],[85,-5],[72,7]
        ],
        [
          [113,-12],[131,-10],[151,-20],[154,-32],[140,-41],[122,-36]
        ]
      ];
  
      const project = (lon, lat) => [
        ((lon + 180) / 360) * canvas.width,
        ((90 - lat) / 180) * canvas.height
      ];
  
      continents.forEach((points, index) => {
        ctx.beginPath();
  
        points.forEach((point, i) => {
          const [x, y] = project(point[0], point[1]);
  
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
  
        ctx.closePath();
  
        const land = ctx.createLinearGradient(0, 80, 0, 930);
        land.addColorStop(0, "#d0d6ae");
        land.addColorStop(0.5, index === 4 ? "#7d9466" : "#a2b58a");
        land.addColorStop(1, "#435f49");
  
        ctx.fillStyle = land;
        ctx.fill();
  
        ctx.strokeStyle = "rgba(238,234,204,.32)";
        ctx.lineWidth = 2;
        ctx.stroke();
      });
  
      // Шабакаи ҷуғрофии нозук
      ctx.strokeStyle = "rgba(230,235,210,.14)";
      ctx.lineWidth = 1;
  
      for (let lon = -150; lon <= 150; lon += 30) {
        const p1 = project(lon, 85);
        const p2 = project(lon, -85);
  
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.stroke();
      }
  
      for (let lat = -60; lat <= 60; lat += 30) {
        const y = project(0, lat)[1];
  
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
  
      const texture = new T.CanvasTexture(canvas);
      texture.colorSpace = T.SRGBColorSpace;
      texture.anisotropy = 4;
  
      return texture;
    }
  
    function createCloudTexture(T) {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 512;
  
      const ctx = canvas.getContext("2d");
  
      for (let i = 0; i < 900; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const width = 4 + Math.random() * 24;
        const height = 1 + Math.random() * 7;
  
        ctx.fillStyle = `rgba(255,255,244,${0.025 + Math.random() * 0.085})`;
        ctx.beginPath();
        ctx.ellipse(x, y, width, height, Math.random() * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
  
      const texture = new T.CanvasTexture(canvas);
      texture.colorSpace = T.SRGBColorSpace;
  
      return texture;
    }
  
    function createEarthLabel(T, lines) {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
  
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, 512, 512);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff7df";
      ctx.font = "800 75px Arial";
  
      lines.forEach((line, index) => {
        ctx.fillText(
          line,
          256,
          256 + (index - (lines.length - 1) / 2) * 84
        );
      });
  
      const texture = new T.CanvasTexture(canvas);
      texture.colorSpace = T.SRGBColorSpace;
  
      return texture;
    }
  
    // =====================================================
    // 4. САҲНАИ 3D БО РӮШНОӢ ВА ЧУҚУРӢ
    // =====================================================
  
    function createScene(container, options = {}) {
      const T = window.THREE;
      const scene = new T.Scene();
  
      const camera = new T.PerspectiveCamera(
        options.fov || 38,
        Math.max(1, container.clientWidth) /
          Math.max(1, container.clientHeight),
        0.1,
        100
      );
  
      camera.position.set(
        options.cameraX || 0,
        options.cameraY || 0,
        options.cameraZ || 4.4
      );
  
      const renderer = new T.WebGLRenderer({
        canvas: options.canvas || undefined,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });
  
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, options.pixelRatio || 1.5)
      );
  
      renderer.outputColorSpace = T.SRGBColorSpace;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.setClearColor(0x000000, 0);
  
      if (options.canvas) {
        // Canvas-и Hero дар HTML аллакай мавҷуд аст.
      } else {
        renderer.domElement.className = "nova-card-canvas";
        renderer.domElement.setAttribute("aria-label", "Модели интерактивии 3D");
        container.appendChild(renderer.domElement);
      }
  
      const ambient = new T.HemisphereLight(0xfff7e5, 0x65764e, 2.0);
      scene.add(ambient);
  
      const keyLight = new T.DirectionalLight(0xffefd1, 3.2);
      keyLight.position.set(-3, 4, 5);
      scene.add(keyLight);
  
      const fillLight = new T.DirectionalLight(0xc0d3ad, 1.25);
      fillLight.position.set(3, 1, 3);
      scene.add(fillLight);
  
      const rimLight = new T.PointLight(0xc9dca5, 1.0, 12);
      rimLight.position.set(1, 2, -3);
      scene.add(rimLight);
  
      const goldLight = new T.PointLight(0xd7b879, 0.65, 9);
      goldLight.position.set(-2, -1, 3);
      scene.add(goldLight);
  
      const root = new T.Group();
      scene.add(root);
  
      // Сояи мулоим дар таги объект
      const shadow = new T.Mesh(
        new T.CircleGeometry(1, 64),
        new T.MeshBasicMaterial({
          color: 0x596b42,
          transparent: true,
          opacity: 0.13,
          depthWrite: false
        })
      );
  
      shadow.position.set(0, -1.0, -0.5);
      shadow.scale.set(1.05, 0.24, 1);
      scene.add(shadow);
  
      // Ҳалқаи ороишии нозук дар паси модел
      if (options.decorativeRing) {
        const decorRing = new T.Mesh(
          new T.TorusGeometry(1.22, 0.004, 8, 160),
          new T.MeshBasicMaterial({
            color: 0xbca36c,
            transparent: true,
            opacity: 0.36
          })
        );
  
        decorRing.position.z = -0.65;
        decorRing.rotation.set(0.18, 0.38, -0.12);
        scene.add(decorRing);
      }
  
      function resize() {
        const width = Math.max(1, container.clientWidth);
        const height = Math.max(1, container.clientHeight);
  
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
  
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
      resize();
  
      return {
        T,
        scene,
        camera,
        renderer,
        root,
        shadow,
        resizeObserver,
        resize
      };
    }
  
    // =====================================================
    // 5. МОДЕЛИ 01 — КОМПЮТЕР
    // =====================================================
  
    function buildComputer(ctx) {
      const { T, root } = ctx;
  
      const frame = makeMaterial(T, "#45583a", 0.28, 0.25);
      const screen = makeMaterial(T, "#17251e", 0.24);
      const gold = makeMaterial(T, "#d3b579", 0.28, 0.3);
      const keys = makeMaterial(T, "#b8c69b", 0.38);
      const metal = makeMaterial(T, "#c7cab1", 0.25, 0.42);
      const glow = new T.MeshStandardMaterial({
        color: "#cee8a5",
        emissive: "#7aaf4d",
        emissiveIntensity: 0.7
      });
  
      // Монитор бо кунҷҳои мулоим
      addBox(T, root, [1.92, 1.26, 0.18], frame, [0, 0.17, -0.16], [0, -0.05, 0], 0.10);
      addBox(T, root, [1.69, 1.03, 0.025], screen, [0, 0.17, -0.045], [0, -0.05, 0], 0.04);
  
      // Нишондиҳандаҳои болои экран
      for (let i = 0; i < 3; i++) {
        addSphere(
          T, root, 0.032,
          i === 0 ? gold : keys,
          [-0.69 + i * 0.10, 0.59, -0.023]
        );
      }
  
      // Сатрҳои рамз
      const codeRows = [
        [-0.46, 0.40, 0.57, glow],
        [-0.28, 0.21, 0.84, gold],
        [-0.38, 0.02, 0.68, keys],
        [-0.22, -0.17, 0.91, gold],
        [-0.39, -0.35, 0.72, glow]
      ];
  
      codeRows.forEach(([x, y, width, material]) => {
        addBox(
          T, root,
          [width, 0.045, 0.018],
          material,
          [x + width / 2, y, -0.025],
          [0, 0, 0],
          0.018
        );
      });
  
      // Пойгоҳи металлӣ
      addBox(T, root, [0.18, 0.28, 0.13], metal, [0, -0.53, -0.15]);
      addBox(T, root, [0.72, 0.075, 0.24], metal, [0, -0.68, 0.02]);
  
      // Клавиатура
      addBox(T, root, [1.54, 0.095, 0.55], metal, [0, -0.81, 0.32], [0.05, 0, 0], 0.065);
  
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 10; col++) {
          addBox(
            T, root,
            [0.087, 0.026, 0.074],
            (col + row) % 4 === 0 ? gold : frame,
            [-0.66 + col * 0.145, -0.755, 0.14 + row * 0.125],
            [0, 0, 0],
            0.012
          );
        }
      }
  
      // Муш
      addSphere(T, root, 0.105, metal, [0.94, -0.8, 0.34], [0.72, 0.46, 1]);
  
      // Аломати рамзгузорӣ дар паҳлу
      addBox(T, root, [0.22, 0.17, 0.04], gold, [0.82, 0.62, -0.1], [0, 0, 0.12], 0.03);
    }
  
    // =====================================================
    // 6. МОДЕЛИ 02 — ЗАМИН
    // =====================================================
  
    function buildEarth(ctx) {
      const { T, root } = ctx;
  
      const planet = new T.Group();
      root.add(planet);
  
      const fallbackMap = createEarthTexture(T);
  
      const earthMaterial = new T.MeshPhysicalMaterial({
        map: fallbackMap,
        roughness: 0.79,
        metalness: 0.015,
        clearcoat: 0.12,
        clearcoatRoughness: 0.65
      });
  
      const earth = new T.Mesh(
        new T.SphereGeometry(0.88, 88, 64),
        earthMaterial
      );
  
      earth.rotation.z = 0.12;
      planet.add(earth);
  
      // Агар текстураи муфассал аз интернет бор шавад, истифода мешавад.
      // Агар бор нашавад, текстураи захиравӣ боқӣ мемонад.
      try {
        const loader = new T.TextureLoader();
        loader.setCrossOrigin("anonymous");
  
        loader.load(
          "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",
          (texture) => {
            texture.colorSpace = T.SRGBColorSpace;
            texture.anisotropy = 4;
            earthMaterial.map = texture;
            earthMaterial.needsUpdate = true;
          },
          undefined,
          () => {
            console.info("Текстураи беруна дастрас нест; текстураи захиравӣ истифода мешавад.");
          }
        );
      } catch (error) {
        console.info("Текстураи иловагӣ бор нашуд.");
      }
  
      // Атмосфера
      const atmosphere = new T.Mesh(
        new T.SphereGeometry(0.94, 72, 56),
        new T.MeshBasicMaterial({
          color: "#a8cca0",
          transparent: true,
          opacity: 0.17,
          side: T.BackSide
        })
      );
  
      planet.add(atmosphere);
  
      // Қабати абрҳо
      const cloudMaterial = new T.MeshStandardMaterial({
        map: createCloudTexture(T),
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
        roughness: 1
      });
  
      const clouds = new T.Mesh(
        new T.SphereGeometry(0.91, 72, 56),
        cloudMaterial
      );
  
      planet.add(clouds);
  
      // Мадори тиллоӣ
      const ring = addTorus(
        T,
        planet,
        1.12,
        0.015,
        makeMaterial(T, "#c4a56c", 0.25, 0.45),
        [0, 0, 0],
        [1.05, 0.12, -0.42]
      );
  
      const fineRing = addTorus(
        T,
        planet,
        1.17,
        0.004,
        makeMaterial(T, "#e3d19b", 0.32, 0.25),
        [0, 0, 0],
        [1.05, 0.12, -0.42]
      );
  
      // Спутник
      const satellite = new T.Group();
      satellite.position.set(1.08, 0.60, 0.13);
      planet.add(satellite);
  
      addBox(
        T, satellite,
        [0.13, 0.12, 0.12],
        makeMaterial(T, "#d5ba7b", 0.22, 0.55),
        [0, 0, 0]
      );
  
      addBox(T, satellite, [0.30, 0.06, 0.035], makeMaterial(T, "#a9bc90", 0.3, 0.3), [-0.20, 0, 0]);
      addBox(T, satellite, [0.30, 0.06, 0.035], makeMaterial(T, "#a9bc90", 0.3, 0.3), [0.20, 0, 0]);
  
      ctx.extraAnimation = (time) => {
        planet.rotation.y += 0.0025;
        clouds.rotation.y += 0.0006;
        satellite.rotation.y += 0.012;
  
        ring.rotation.z += 0.0001;
        fineRing.rotation.z += 0.0001;
      };
    }
  
    // =====================================================
    // 7. МОДЕЛИ 03 — КИТОБ
    // =====================================================
  
    function buildBook(ctx) {
      const { T, root } = ctx;
  
      const book = new T.Group();
      book.position.set(-0.12, -0.02, 0);
      book.rotation.set(-0.05, -0.15, -0.11);
      root.add(book);
  
      const cover = makeMaterial(T, "#71875a", 0.4, 0.05);
      const pages = makeMaterial(T, "#f4f0dc", 0.82);
      const gold = makeMaterial(T, "#c7ab70", 0.26, 0.35);
      const sidePages = makeMaterial(T, "#e0ddc7", 0.85);
  
      // Саҳифаҳо ва муқова
      addBox(T, book, [1.28, 1.47, 0.18], pages, [0, 0, 0], [0, 0, 0], 0.035);
      addBox(T, book, [1.33, 1.52, 0.065], cover, [0, 0, 0.13], [0, 0, 0], 0.045);
      addBox(T, book, [0.085, 1.43, 0.028], gold, [-0.61, 0, 0.17], [0, 0, 0], 0.015);
  
      // Сатҳҳои саҳифа
      for (let i = 0; i < 5; i++) {
        addBox(
          T, book,
          [1.15, 0.018, 0.19],
          i % 2 === 0 ? sidePages : pages,
          [0, -0.61 + i * 0.036, -0.025],
          [0, 0, 0],
          0.006
        );
      }
  
      // Навиштаҷоти рӯи муқова
      const title = new T.Mesh(
        new T.PlaneGeometry(0.91, 0.83),
        new T.MeshBasicMaterial({
          map: createEarthLabel(T, ["KNOW", "MORE"]),
          transparent: true,
          side: T.DoubleSide
        })
      );
  
      title.position.set(0.02, 0, 0.168);
      book.add(title);
  
      // Нишонаи илмӣ — атом
      const atom = new T.Group();
      atom.position.set(0.74, 0.48, 0.26);
      root.add(atom);
  
      const atomGold = makeMaterial(T, "#c3a56d", 0.25, 0.42);
  
      [0, 1.05, -1.05].forEach((angle) => {
        const orbit = addTorus(
          T, atom,
          0.29, 0.008,
          atomGold,
          [0, 0, 0],
          [angle, 0.36, angle * 0.45]
        );
  
        orbit.material = atomGold;
      });
  
      addSphere(T, atom, 0.062, atomGold, [0, 0, 0]);
  
      // Гӯшаҳои тиллоии китоб
      addBox(T, book, [0.12, 0.035, 0.035], gold, [0.49, 0.65, 0.18], [0, 0, 0], 0.009);
  
      ctx.extraAnimation = () => {
        atom.rotation.y += 0.006;
      };
    }
  
    // =====================================================
    // 8. МОДЕЛИ 04 — РОБОТИ NOVA AI
    // =====================================================
  
    function buildRobot(ctx) {
      const { T, root } = ctx;
  
      const green = makeMaterial(T, "#45583a", 0.3, 0.18);
      const dark = makeMaterial(T, "#27362a", 0.24, 0.14);
      const light = makeMaterial(T, "#bac8a0", 0.35, 0.12);
      const gold = makeMaterial(T, "#c9aa70", 0.23, 0.48);
  
      const eyeMaterial = new T.MeshPhysicalMaterial({
        color: "#f4f7d9",
        emissive: "#b8df90",
        emissiveIntensity: 2.0,
        roughness: 0.18,
        clearcoat: 0.7
      });
  
      // Бадани робот
      addBox(T, root, [0.90, 0.72, 0.57], light, [0, -0.39, 0], [0, 0, 0], 0.16);
  
      // Панели сина
      addBox(T, root, [0.73, 0.48, 0.06], dark, [0, -0.38, 0.30], [0, 0, 0], 0.10);
  
      // Сари робот
      addBox(T, root, [1.25, 0.88, 0.59], green, [0, 0.43, 0], [0, 0, 0], 0.19);
  
      // Маскаи рӯй
      addBox(T, root, [1.06, 0.65, 0.045], dark, [0, 0.43, 0.31], [0, 0, 0], 0.12);
  
      // Чашмҳои равшан
      addSphere(T, root, 0.085, eyeMaterial, [-0.25, 0.45, 0.35]);
      addSphere(T, root, 0.085, eyeMaterial, [0.25, 0.45, 0.35]);
  
      // Даҳони тиллоӣ
      addBox(T, root, [0.19, 0.038, 0.025], gold, [0, 0.19, 0.36], [0, 0, 0], 0.014);
  
      // Антенна ва чароғи болои сар
      addCylinder(T, root, 0.028, 0.20, gold, [0, 0.96, 0]);
      addSphere(T, root, 0.082, eyeMaterial, [0, 1.08, 0]);
  
      // Дастҳо
      const leftArm = addCylinder(
        T, root, 0.075, 0.44, green,
        [-0.63, -0.38, 0],
        [0, 0, -0.40]
      );
  
      const rightArm = addCylinder(
        T, root, 0.075, 0.44, green,
        [0.63, -0.38, 0],
        [0, 0, 0.40]
      );
  
      addSphere(T, root, 0.105, light, [-0.76, -0.59, 0.02]);
      addSphere(T, root, 0.105, light, [0.76, -0.59, 0.02]);
  
      // Пойҳо ва кафш
      addCylinder(T, root, 0.085, 0.24, green, [-0.24, -0.87, 0]);
      addCylinder(T, root, 0.085, 0.24, green, [0.24, -0.87, 0]);
  
      addBox(T, root, [0.30, 0.10, 0.33], dark, [-0.24, -1.00, 0.05], [0, 0, 0], 0.045);
      addBox(T, root, [0.30, 0.10, 0.33], dark, [0.24, -1.00, 0.05], [0, 0, 0], 0.045);
  
      // МИКРОСХЕМАИ NOVA AI ДАР СИНАИ РОБОТ
      const chipMaterial = new T.MeshPhysicalMaterial({
        color: "#a9db91",
        emissive: "#4eaf52",
        emissiveIntensity: 1.25,
        metalness: 0.25,
        roughness: 0.25,
        clearcoat: 0.7
      });
  
      addTorus(
        T, root,
        0.19, 0.014,
        gold,
        [0, -0.38, 0.35]
      );
  
      addBox(
        T, root,
        [0.16, 0.16, 0.045],
        chipMaterial,
        [0, -0.38, 0.36],
        [0, 0, 0],
        0.025
      );
  
      // Хатҳои схемаи электронии сабзу тиллоӣ
      addBox(T, root, [0.15, 0.018, 0.018], chipMaterial, [-0.25, -0.38, 0.35], [0, 0, 0], 0.006);
      addBox(T, root, [0.15, 0.018, 0.018], chipMaterial, [0.25, -0.38, 0.35], [0, 0, 0], 0.006);
  
      addBox(T, root, [0.018, 0.12, 0.018], gold, [-0.32, -0.28, 0.35], [0, 0, 0], 0.005);
      addBox(T, root, [0.018, 0.12, 0.018], gold, [0.32, -0.28, 0.35], [0, 0, 0], 0.005);
  
      addSphere(T, root, 0.028, chipMaterial, [-0.32, -0.38, 0.36]);
      addSphere(T, root, 0.028, chipMaterial, [0.32, -0.38, 0.36]);
  
      ctx.extraAnimation = (time) => {
        leftArm.rotation.z = -0.40 + Math.sin(time * 1.3) * 0.07;
        rightArm.rotation.z = 0.40 - Math.sin(time * 1.3) * 0.07;
      };
    }
  
    // =====================================================
    // 9. МОДЕЛИ 05 — ҶОМАДОНИ КАСБ
    // =====================================================
  
    function buildCareer(ctx) {
      const { T, root } = ctx;
  
      const green = makeMaterial(T, "#7e9160", 0.34, 0.06);
      const light = makeMaterial(T, "#cad0b0", 0.38);
      const gold = makeMaterial(T, "#c6a66b", 0.24, 0.45);
      const dark = makeMaterial(T, "#465a39", 0.30, 0.1);
  
      const bag = new T.Group();
      bag.rotation.z = -0.07;
      root.add(bag);
  
      // Корпуси асосӣ
      addBox(T, bag, [1.52, 0.98, 0.43], green, [0, -0.10, 0], [0, 0, 0], 0.13);
  
      // Тасма ва қулф
      addBox(T, bag, [1.39, 0.065, 0.035], light, [0, 0.15, 0.23], [0, 0, 0], 0.014);
      addBox(T, bag, [0.15, 0.20, 0.06], gold, [0, -0.13, 0.24], [0, 0, 0], 0.025);
  
      // Даста бо шакли камон
      addBox(T, bag, [0.10, 0.22, 0.085], dark, [-0.43, 0.47, 0], [0, 0, 0], 0.03);
      addBox(T, bag, [0.10, 0.22, 0.085], dark, [0.43, 0.47, 0], [0, 0, 0], 0.03);
      addBox(T, bag, [0.90, 0.085, 0.085], dark, [0, 0.56, 0], [0, 0, 0], 0.03);
  
      // Ситораи панҷгӯша
      const starShape = new T.Shape();
  
      for (let i = 0; i < 10; i++) {
        const radius = i % 2 === 0 ? 0.19 : 0.085;
        const angle = i * Math.PI / 5 - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
  
        if (i === 0) starShape.moveTo(x, y);
        else starShape.lineTo(x, y);
      }
  
      starShape.closePath();
  
      const star = new T.Mesh(
        new T.ShapeGeometry(starShape),
        gold
      );
  
      star.position.set(0, -0.09, 0.235);
      bag.add(star);
  
      // Зинаҳои пешрафт
      for (let i = 0; i < 4; i++) {
        addBox(
          T, root,
          [0.15, 0.16 + i * 0.13, 0.19],
          i === 3 ? gold : light,
          [-1.12 + i * 0.19, -0.72 + i * 0.065, -0.08],
          [0, 0, 0],
          0.025
        );
      }
  
      // Тирчаи болоравӣ
      const arrow = new T.Group();
      arrow.position.set(0.95, 0.59, 0.15);
      root.add(arrow);
  
      const shaft = addBox(
        T, arrow,
        [0.49, 0.028, 0.028],
        gold,
        [0, 0, 0],
        [0, 0, Math.PI / 4],
        0.01
      );
  
      const tip = new T.Mesh(
        new T.ConeGeometry(0.09, 0.20, 4),
        gold
      );
  
      tip.position.set(0.18, 0.18, 0);
      tip.rotation.z = 0.55;
      arrow.add(tip);
    }
  
    // =====================================================
    // 10. ИНТЕРАКТИВИИ 3D ДАР ПАНҶ КОРТ
    // =====================================================
  
    function startCard3D() {
      if (!window.THREE) return;
  
      const containers = [
        ...document.querySelectorAll(".illustration[data-object]")
      ];
  
      containers.forEach((container) => {
        if (container.dataset.nova3d === "ready") return;
  
        const type = container.dataset.object;
        if (!container.clientWidth || !container.clientHeight) return;
  
        let ctx;
  
        try {
          ctx = createScene(container, {
            cameraZ: type === "earth" ? 4.05 : 4.55,
            decorativeRing: true,
            pixelRatio: 1.35
          });
  
          if (type === "computer") buildComputer(ctx);
          else if (type === "earth") buildEarth(ctx);
          else if (type === "book") buildBook(ctx);
          else if (type === "robot") buildRobot(ctx);
          else if (type === "career") buildCareer(ctx);
  
          // Модел сохта шуд. Акнун расми захиравӣ пинҳон мешавад.
          container.classList.add("is-3d");
          container.dataset.nova3d = "ready";
  
        } catch (error) {
          console.error("Модели 3D сохта нашуд:", type, error);
  
          if (ctx) {
            ctx.resizeObserver.disconnect();
            ctx.renderer.dispose();
            ctx.renderer.domElement.remove();
          }
  
          return;
        }
  
        const canvas = ctx.renderer.domElement;
  
        let dragging = false;
        let lastX = 0;
        let lastY = 0;
        let targetX = -0.03;
        let targetY = type === "earth" ? -0.2 : -0.13;
        let elapsed = Math.random() * 10;
        let frameId = 0;
  
        canvas.setAttribute("aria-label", "Модели сеандозаи интерактивӣ");
  
        canvas.addEventListener("pointerdown", (event) => {
          dragging = true;
          lastX = event.clientX;
          lastY = event.clientY;
          canvas.setPointerCapture?.(event.pointerId);
        });
  
        canvas.addEventListener("pointermove", (event) => {
          if (!dragging) return;
  
          targetY += (event.clientX - lastX) * 0.008;
          targetX += (event.clientY - lastY) * 0.006;
  
          targetX = Math.max(-0.48, Math.min(0.48, targetX));
  
          lastX = event.clientX;
          lastY = event.clientY;
        });
  
        const stopDrag = () => {
          dragging = false;
        };
  
        canvas.addEventListener("pointerup", stopDrag);
        canvas.addEventListener("pointercancel", stopDrag);
        canvas.addEventListener("lostpointercapture", stopDrag);
  
        let previousTime = 0;
  
        function animate(time) {
          frameId = requestAnimationFrame(animate);
  
          const delta = previousTime
            ? Math.min((time - previousTime) / 1000, 0.04)
            : 0.016;
  
          previousTime = time;
          elapsed += delta;
  
          if (!dragging) {
            targetY += (type === "earth" ? 0.17 : 0.075) * delta;
          }
  
          ctx.root.rotation.x += (targetX - ctx.root.rotation.x) * 0.055;
          ctx.root.rotation.y += (targetY - ctx.root.rotation.y) * 0.055;
  
          // Ҳаракати сабуки боло-поён
          ctx.root.position.y = Math.sin(elapsed * 1.3) * 0.035;
  
          if (typeof ctx.extraAnimation === "function") {
            ctx.extraAnimation(elapsed);
          }
  
          ctx.renderer.render(ctx.scene, ctx.camera);
        }
  
        animate();
  
        container._novaCleanup = () => {
          cancelAnimationFrame(frameId);
          ctx.resizeObserver.disconnect();
  
          ctx.scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
  
            if (object.material) {
              const materials = Array.isArray(object.material)
                ? object.material
                : [object.material];
  
              materials.forEach((item) => {
                if (item.map) item.map.dispose();
                item.dispose();
              });
            }
          });
  
          ctx.renderer.dispose();
        };
      });
    }
  
    // =====================================================
    // 11. ГЛОБУСИ КАЛОНИ САҲИФА
    // =====================================================
  
    function startHero3D() {
      const canvas = $("hero3d");
      if (!canvas || !window.THREE) return;
  
      const T = window.THREE;
      const container = canvas.parentElement;
  
      let ctx;
  
      try {
        ctx = createScene(container, {
          canvas,
          cameraZ: 4.6,
          pixelRatio: 1.55
        });
  
        const world = ctx.root;
  
        const earthMaterial = new T.MeshPhysicalMaterial({
          map: createEarthTexture(T),
          roughness: 0.80,
          metalness: 0.015,
          clearcoat: 0.15,
          clearcoatRoughness: 0.58
        });
  
        const earth = new T.Mesh(
          new T.SphereGeometry(1.12, 100, 76),
          earthMaterial
        );
  
        world.add(earth);
  
        // Текстураи муфассали иловагӣ, агар интернет дастрас бошад.
        try {
          const loader = new T.TextureLoader();
          loader.setCrossOrigin("anonymous");
  
          loader.load(
            "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",
            (texture) => {
              texture.colorSpace = T.SRGBColorSpace;
              texture.anisotropy = 4;
              earthMaterial.map = texture;
              earthMaterial.needsUpdate = true;
            },
            undefined,
            () => console.info("Текстураи иловагӣ дастрас нест.")
          );
        } catch (error) {
          console.info("Текстураи иловагӣ бор нашуд.");
        }
  
        // Абрҳо
        const clouds = new T.Mesh(
          new T.SphereGeometry(1.145, 80, 64),
          new T.MeshStandardMaterial({
            map: createCloudTexture(T),
            transparent: true,
            opacity: 0.38,
            depthWrite: false,
            roughness: 1
          })
        );
  
        world.add(clouds);
  
        // Атмосфераи сабзи мулоим
        const atmosphere = new T.Mesh(
          new T.SphereGeometry(1.205, 72, 56),
          new T.ShaderMaterial({
            uniforms: {
              glowColor: { value: new T.Color(0xa7c995) },
              glowPower: { value: 2.25 },
              glowOpacity: { value: 0.56 }
            },
  
            vertexShader: `
              varying vec3 vNormal;
              varying vec3 vViewPosition;
  
              void main() {
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vNormal = normalize(normalMatrix * normal);
                vViewPosition = -mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
              }
            `,
  
            fragmentShader: `
              uniform vec3 glowColor;
              uniform float glowPower;
              uniform float glowOpacity;
  
              varying vec3 vNormal;
              varying vec3 vViewPosition;
  
              void main() {
                float intensity = pow(
                  0.78 - dot(
                    normalize(vNormal),
                    normalize(vViewPosition)
                  ),
                  glowPower
                );
  
                gl_FragColor = vec4(
                  glowColor,
                  intensity * glowOpacity
                );
              }
            `,
  
            side: T.BackSide,
            blending: T.AdditiveBlending,
            transparent: true,
            depthWrite: false
          })
        );
  
        world.add(atmosphere);
  
        // Ҳалқаи тиллоӣ
        const ringOne = addTorus(
          T, world,
          1.43, 0.005,
          new T.MeshBasicMaterial({
            color: 0x8c9c70,
            transparent: true,
            opacity: 0.72
          }),
          [0, 0, 0],
          [1.12, 0.18, -0.28]
        );
  
        const ringTwo = addTorus(
          T, world,
          1.50, 0.003,
          new T.MeshBasicMaterial({
            color: 0xc3a76d,
            transparent: true,
            opacity: 0.62
          }),
          [0, 0, 0],
          [0.78, -0.55, 0.32]
        );
  
        // Зарраҳои нозуки атрофи глобус
        const count = 440;
        const positions = new Float32Array(count * 3);
  
        for (let i = 0; i < count; i++) {
          const radius = 1.65 + Math.random() * 1.40;
          const theta = Math.random() * Math.PI * 2;
          const u = Math.random() * 2 - 1;
          const phi = Math.acos(u);
  
          positions[i * 3] =
            radius * Math.sin(phi) * Math.cos(theta);
  
          positions[i * 3 + 1] =
            radius * Math.cos(phi);
  
          positions[i * 3 + 2] =
            radius * Math.sin(phi) * Math.sin(theta);
        }
  
        const starsGeometry = new T.BufferGeometry();
  
        starsGeometry.setAttribute(
          "position",
          new T.BufferAttribute(positions, 3)
        );
  
        const stars = new T.Points(
          starsGeometry,
          new T.PointsMaterial({
            color: 0x93a27a,
            size: 0.012,
            transparent: true,
            opacity: 0.62
          })
        );
  
        ctx.scene.add(stars);
  
        let dragging = false;
        let lastX = 0;
        let lastY = 0;
        let rotationX = 0.02;
        let rotationY = -0.25;
        let frameId = 0;
        let previousTime = 0;
  
        canvas.addEventListener("pointerdown", (event) => {
          dragging = true;
          lastX = event.clientX;
          lastY = event.clientY;
          canvas.setPointerCapture?.(event.pointerId);
        });
  
        canvas.addEventListener("pointermove", (event) => {
          if (!dragging) return;
  
          rotationY += (event.clientX - lastX) * 0.006;
          rotationX += (event.clientY - lastY) * 0.004;
  
          rotationX = Math.max(-0.7, Math.min(0.7, rotationX));
  
          lastX = event.clientX;
          lastY = event.clientY;
        });
  
        const stopDrag = () => {
          dragging = false;
        };
  
        canvas.addEventListener("pointerup", stopDrag);
        canvas.addEventListener("pointercancel", stopDrag);
        canvas.addEventListener("lostpointercapture", stopDrag);
  
        function animate(time) {
          frameId = requestAnimationFrame(animate);
  
          const delta = previousTime
            ? Math.min((time - previousTime) / 1000, 0.04)
            : 0.016;
  
          previousTime = time;
  
          if (!dragging) {
            rotationY += 0.10 * delta;
          }
  
          world.rotation.x += (rotationX - world.rotation.x) * 0.04;
          world.rotation.y += (rotationY - world.rotation.y) * 0.04;
  
          clouds.rotation.y += delta * 0.012;
          stars.rotation.y -= delta * 0.005;
  
          ringOne.rotation.z += delta * 0.008;
          ringTwo.rotation.z -= delta * 0.005;
  
          ctx.renderer.render(ctx.scene, ctx.camera);
        }
  
        animate();
  
        canvas._novaCleanup = () => {
          cancelAnimationFrame(frameId);
          ctx.resizeObserver.disconnect();
  
          ctx.scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
  
            if (object.material) {
              const materials = Array.isArray(object.material)
                ? object.material
                : [object.material];
  
              materials.forEach((item) => {
                if (item.map) item.map.dispose();
                item.dispose();
              });
            }
          });
  
          ctx.renderer.dispose();
        };
  
      } catch (error) {
        console.error("Глобуси 3D оғоз нашуд:", error);
        toast("Глобуси 3D оғоз нашуд. Браузерро санҷ.");
      }
    }
  
    // =====================================================
    // 12. НАВИГАТСИЯИ САЙТ
    // =====================================================
  
    const workspace = $("workspace");
  
    const panelTitles = {
      studio: "Code Studio",
      map: "Харитаи 3D",
      learn: "Дониш ва дарсҳо",
      ai: "AI ёрдамчӣ",
      jobs: "Корёбӣ ва касб"
    };
  
    function openPanel(name) {
      if (!panelTitles[name] || !workspace) return;
  
      workspace.hidden = false;
  
      document.querySelectorAll(".tool-panel").forEach((panel) => {
        panel.hidden = panel.id !== "panel-" + name;
      });
  
      document.querySelectorAll(".workspace-nav").forEach((button) => {
        button.classList.toggle(
          "selected",
          button.dataset.panel === name
        );
      });
  
      $("workspaceTitle").textContent = panelTitles[name];
  
      workspace.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  
    document.querySelectorAll("[data-open]").forEach((button) => {
      button.addEventListener("click", () => {
        openPanel(button.dataset.open);
      });
    });
  
    document.querySelectorAll(".workspace-nav").forEach((button) => {
      button.addEventListener("click", () => {
        openPanel(button.dataset.panel);
      });
    });
  
    $("closeWorkspace").addEventListener("click", () => {
      workspace.hidden = true;
      $("services").scrollIntoView({ behavior: "smooth" });
    });
  
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        document.querySelectorAll(".nav-link").forEach((item) => {
          item.classList.toggle("active", item === link);
        });
      });
    });
  
    // =====================================================
    // 13. CODE STUDIO
    // =====================================================
  
    const editor = $("codeEditor");
    const output = $("terminalOutput");
  
    const studio = {
      root: null,
      currentDir: null,
      fileHandle: null,
      fileName: ""
    };
  
    function terminal(message) {
      const line = document.createElement("div");
      line.textContent = message;
      output.appendChild(line);
      output.scrollTop = output.scrollHeight;
    }
  
    function setEditor(content, name, handle) {
      editor.value = content;
      studio.fileName = name || "";
      studio.fileHandle = handle || null;
  
      $("editorTab").textContent = name || "Welcome";
      $("editorStatus").textContent = "Омода";
  
      $("editorLanguage").textContent =
        name && name.includes(".")
          ? name.split(".").pop().toUpperCase()
          : "TEXT";
    }
  
    editor.addEventListener("input", () => {
      $("editorStatus").textContent = "Тағйир ёфтааст";
    });
  
    editor.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
  
      event.preventDefault();
  
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
  
      editor.setRangeText("  ", start, end, "end");
      editor.dispatchEvent(new Event("input"));
    });
  
    async function renderTree(dir, container, path = "") {
      const items = [];
  
      for await (const item of dir.values()) {
        items.push(item);
      }
  
      items.sort((a, b) => {
        if (a.kind !== b.kind) {
          return a.kind === "directory" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
  
      for (const item of items) {
        const button = document.createElement("button");
        button.className = "file-entry";
  
        const currentPath = path
          ? path + "/" + item.name
          : item.name;
  
        button.textContent =
          (item.kind === "directory" ? "📁 " : "📄 ") + item.name;
  
        container.appendChild(button);
  
        if (item.kind === "directory") {
          const childBox = document.createElement("div");
          childBox.hidden = true;
          childBox.style.paddingLeft = "10px";
          container.appendChild(childBox);
  
          button.addEventListener("click", async () => {
            childBox.hidden = !childBox.hidden;
            studio.currentDir = item;
  
            if (!childBox.hidden && childBox.dataset.loaded !== "yes") {
              await renderTree(item, childBox, currentPath);
              childBox.dataset.loaded = "yes";
            }
          });
        } else {
          button.addEventListener("click", async () => {
            try {
              const file = await item.getFile();
              const content = await file.text();
  
              studio.currentDir = dir;
              setEditor(content, currentPath, item);
  
              document.querySelectorAll(".file-entry").forEach((entry) => {
                entry.classList.toggle("active", entry === button);
              });
            } catch (error) {
              toast("Файл кушода нашуд: " + error.message);
            }
          });
        }
      }
    }
  
    $("openFolder").addEventListener("click", async () => {
      if (!window.showDirectoryPicker) {
        toast("Барои Open Folder браузери Chrome ё Edge-и навро истифода бар.");
        return;
      }
  
      try {
        const root = await window.showDirectoryPicker({
          mode: "readwrite"
        });
  
        studio.root = root;
        studio.currentDir = root;
  
        $("projectName").textContent = root.name;
        $("fileTree").replaceChildren();
  
        await renderTree(root, $("fileTree"));
        setEditor("", "", null);
  
        terminal("Папка кушода шуд: " + root.name);
        toast("Папка кушода шуд.");
  
      } catch (error) {
        if (error.name !== "AbortError") {
          toast("Хато: " + error.message);
        }
      }
    });
  
    $("newFile").addEventListener("click", async () => {
      if (!studio.currentDir) {
        toast("Аввал Open Folder-ро пахш кун.");
        return;
      }
  
      const name = prompt("Номи файл:", "index.html");
  
      if (!name || name.includes("/") || name.includes("\\")) return;
  
      try {
        const cleanName = name.trim();
  
        const handle = await studio.currentDir.getFileHandle(
          cleanName,
          { create: true }
        );
  
        const writer = await handle.createWritable();
        await writer.write("");
        await writer.close();
  
        $("fileTree").replaceChildren();
        await renderTree(studio.root, $("fileTree"));
  
        setEditor("", cleanName, handle);
        toast("Файл сохта шуд.");
  
      } catch (error) {
        toast("Файл сохта нашуд: " + error.message);
      }
    });
  
    async function saveFile() {
      if (!studio.fileHandle) {
        toast("Аввал файлро аз Explorer кушо.");
        return;
      }
  
      try {
        const writer = await studio.fileHandle.createWritable();
        await writer.write(editor.value);
        await writer.close();
  
        $("editorStatus").textContent = "Захира шуд";
        toast("Файл захира шуд.");
  
      } catch (error) {
        toast("Захира нашуд: " + error.message);
      }
    }
  
    $("saveFile").addEventListener("click", saveFile);
  
    document.addEventListener("keydown", (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "s" &&
        !workspace.hidden &&
        !$("panel-studio").hidden
      ) {
        event.preventDefault();
        saveFile();
      }
    });
  
    $("clearTerminal").addEventListener("click", () => {
      output.replaceChildren();
    });
  
    $("terminalForm").addEventListener("submit", (event) => {
      event.preventDefault();
  
      const command = $("terminalInput").value.trim();
      $("terminalInput").value = "";
  
      if (!command) return;
  
      terminal("nova > " + command);
  
      const [cmd, ...args] = command.split(" ");
  
      if (cmd === "help") {
        terminal("Фармонҳо: help, pwd, echo, clear");
      } else if (cmd === "pwd") {
        terminal(
          studio.root
            ? studio.root.name
            : "Папка кушода нашудааст"
        );
      } else if (cmd === "echo") {
        terminal(args.join(" "));
      } else if (cmd === "clear") {
        output.replaceChildren();
      } else {
        terminal("Фармон ёфт нашуд. help навис.");
      }
    });
  
    // =====================================================
    // 14. ХАРИТА
    // =====================================================
  
    $("mapForm").addEventListener("submit", (event) => {
      event.preventDefault();
  
      const query = $("mapSearch").value.trim();
      if (!query) return;
  
      const url =
        "https://www.openstreetmap.org/search?query=" +
        encodeURIComponent(query);
  
      window.open(url, "_blank", "noopener,noreferrer");
    });
  
    // =====================================================
    // 15. ДАРСҲО
    // =====================================================
  
    const lessons = {
      "Математика":
        "Аз ададҳо ва касрҳо оғоз кун. Сипас муодилаҳо, геометрия ва масъалаҳои амалӣ омӯз.",
  
      "Физика":
        "Физика ҳаракат, қувва ва энергияро меомӯзад. Аз воҳидҳои ченак ва қонунҳои асосӣ сар кун.",
  
      "Химия":
        "Аз атом, элементҳо ва ҷадвали даврӣ сар кун. Таҷрибаҳои хатарнокро танҳо иҷро накун.",
  
      "Биология":
        "Биология ҳаётро меомӯзад: ҳуҷайра, узвҳо, организмҳо ва муҳити зист.",
  
      "Технология":
        "Аз сахтафзори компютер, системаҳои амалиётӣ, интернет ва шабакаҳо сар кун.",
  
      "Англисӣ":
        "Ҳар рӯз панҷ калима омӯз, бо онҳо ҷумла соз ва гуфтугӯи кӯтоҳро машқ кун."
    };
  
    document.querySelectorAll("[data-subject]").forEach((button) => {
      button.addEventListener("click", () => {
        const subject = button.dataset.subject;
        $("lessonResult").textContent =
          subject + ": " + lessons[subject];
      });
    });
  
    // =====================================================
    // 16. AI-ЁРДАМЧИИ НАМУНАВӢ
    // =====================================================
  
    function addChat(message, type) {
      const element = document.createElement("div");
      element.className = "chat-bubble " + type;
      element.textContent = message;
  
      $("chatWindow").appendChild(element);
      $("chatWindow").scrollTop = $("chatWindow").scrollHeight;
    }
  
    $("chatForm").addEventListener("submit", (event) => {
      event.preventDefault();
  
      const question = $("chatInput").value.trim();
      if (!question) return;
  
      addChat(question, "user");
      $("chatInput").value = "";
  
      const q = question.toLowerCase();
  
      let answer =
        "Саволро мушаххастар навис. Метавонӣ дар бораи код, дарс ё технология пурсӣ.";
  
      if (/салом|привет|hello/.test(q)) {
        answer = "Салом! Хуш омадӣ. Имрӯз чӣ омӯхтан ё сохтан мехоҳӣ?";
      } else if (/физика/.test(q)) {
        answer = lessons["Физика"];
        openPanel("learn");
      } else if (/химия/.test(q)) {
        answer = lessons["Химия"];
        openPanel("learn");
      } else if (/биолог/.test(q)) {
        answer = lessons["Биология"];
        openPanel("learn");
      } else if (/математика|ҳисоб|каср/.test(q)) {
        answer = lessons["Математика"];
        openPanel("learn");
      } else if (/харита|амрико|америка|ҷаҳон|кишвар/.test(q)) {
        answer = "Бахши харита кушода шуд. Шаҳр ё кишварро ворид кун.";
        openPanel("map");
      } else if (/html|css|javascript|код|сайт|барномасоз/.test(q)) {
        answer =
          "HTML сохтори саҳифаро месозад, CSS намуди онро танзим мекунад ва JavaScript функсияҳоро фаъол мекунад.";
        openPanel("studio");
      } else if (/кор|касб|резюме/.test(q)) {
        answer =
          "Як малака интихоб кун, лоиҳа соз ва натиҷаҳоятро ба портфолио илова кун.";
        openPanel("jobs");
      }
  
      setTimeout(() => addChat(answer, "bot"), 200);
    });
  
    // =====================================================
    // 17. КАСБҲО
    // =====================================================
  
    const jobs = {
      "Барномасоз":
        "HTML, CSS ва JavaScript омӯз. Се лоиҳаи хурд соз ва онҳоро ба портфолио илова кун.",
  
      "Дизайнер":
        "Асосҳои ранг, таркиб, типография ва UX/UI омӯз. Портфолио аз корҳои худ соз.",
  
      "Мутахассиси IT":
        "Аз сахтафзор, системаҳои амалиётӣ, шабака ва амнияти рақамӣ сар кун.",
  
      "Тарҷумон":
        "Забонро мунтазам омӯз, луғат ҷамъ кун ва намунаҳои тарҷумаи худро омода соз."
    };
  
    document.querySelectorAll("[data-job]").forEach((button) => {
      button.addEventListener("click", () => {
        const job = button.dataset.job;
        $("jobResult").textContent = job + ": " + jobs[job];
      });
    });
  
    // =====================================================
    // 18. РАНГ ВА ҶУСТУҶӮ
    // =====================================================
  
    $("themeToggle").addEventListener("click", () => {
      document.body.classList.toggle("dark");
  
      toast(
        document.body.classList.contains("dark")
          ? "Намуди торик фаъол шуд."
          : "Намуди равшан фаъол шуд."
      );
    });
  
    $("searchToggle").addEventListener("click", () => {
      const query = prompt(
        "Чиро меҷӯӣ? Code Studio, Харита, Дониш, AI ё Корёбӣ"
      );
  
      if (!query) return;
  
      const q = query.toLowerCase();
  
      if (/code|studio|код|сайт/.test(q)) {
        openPanel("studio");
      } else if (/харита|map|ҷаҳон|амрико|америка/.test(q)) {
        openPanel("map");
      } else if (/дарс|дониш|физика|математика/.test(q)) {
        openPanel("learn");
      } else if (/ai|ёрдам|савол/.test(q)) {
        openPanel("ai");
      } else if (/кор|касб|job/.test(q)) {
        openPanel("jobs");
      } else {
        toast("Бахш ёфт нашуд. Аз кортҳои асосӣ истифода бар.");
      }
    });
  
    // =====================================================
    // 19. ОҒОЗИ ҲАМАИ САҲНАҲО
    // =====================================================
  
    function startAll3D() {
      if (!window.THREE) {
        console.error("Three.js бор нашуд. Интернетро санҷ.");
        toast("Китобхонаи 3D бор нашуд. Интернетро санҷ.");
        return;
      }
  
      startHero3D();
      startCard3D();
    }
  
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", startAll3D, { once: true });
    } else {
      startAll3D();
    }
  
    // =====================================================
    // 20. ТОЗАКУНИИ САҲНАҲО
    // =====================================================
  
    window.addEventListener("beforeunload", () => {
      document.querySelectorAll(".illustration").forEach((container) => {
        if (typeof container._novaCleanup === "function") {
          container._novaCleanup();
        }
      });
  
      const heroCanvas = $("hero3d");
  
      if (
        heroCanvas &&
        typeof heroCanvas._novaCleanup === "function"
      ) {
        heroCanvas._novaCleanup();
      }
    });
  
  })();