document.addEventListener('DOMContentLoaded', () => {

  const navItems = document.querySelectorAll('.nav-item');
  const actionTriggers = document.querySelectorAll('.nav-trigger');
  const sections = document.querySelectorAll('.spa-view');

  const spaceTag = document.getElementById('space-tag');
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');

  let mouse = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  };

  let ring = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  };

  let snapTarget = null;

  let ringWidth = 36;
  let ringHeight = 36;


  /* =========================
     CURSOR
     ========================= */

  window.addEventListener('mousemove', (e) => {

    mouse.x = e.clientX;
    mouse.y = e.clientY;

    if (cursorDot) {

      cursorDot.style.transform =
        `translate3d(
          calc(${mouse.x}px - 50%),
          calc(${mouse.y}px - 50%),
          0
        )`;

    }

  });


  function animateCursor() {

    if (snapTarget) {

      const rect =
        snapTarget.getBoundingClientRect();

      const targetX =
        rect.left + rect.width / 2;

      const targetY =
        rect.top + rect.height / 2;

      ring.x +=
        (targetX - ring.x) * 0.28;

      ring.y +=
        (targetY - ring.y) * 0.28;

      ringWidth =
        rect.width + 16;

      ringHeight =
        rect.height + 10;

    } else {

      ring.x +=
        (mouse.x - ring.x) * 0.15;

      ring.y +=
        (mouse.y - ring.y) * 0.15;

      ringWidth = 36;
      ringHeight = 36;

    }

    if (cursorRing) {

      cursorRing.style.width =
        `${ringWidth}px`;

      cursorRing.style.height =
        `${ringHeight}px`;

      cursorRing.style.transform =
        `translate3d(
          calc(${ring.x}px - 50%),
          calc(${ring.y}px - 50%),
          0
        )`;

    }

    requestAnimationFrame(
      animateCursor
    );

  }

  requestAnimationFrame(
    animateCursor
  );


  /* =========================
     MAGNETIC ELEMENTS
     ========================= */

  function applyMagneticBehaviors() {

    const magneticTargets =
      document.querySelectorAll(
        '.magnetic-target'
      );

    magneticTargets.forEach(target => {

      target.removeEventListener(
        'mouseenter',
        onTargetEnter
      );

      target.removeEventListener(
        'mouseleave',
        onTargetLeave
      );

      target.removeEventListener(
        'mousemove',
        onTargetMove
      );

      target.addEventListener(
        'mouseenter',
        onTargetEnter
      );

      target.addEventListener(
        'mouseleave',
        onTargetLeave
      );

      target.addEventListener(
        'mousemove',
        onTargetMove
      );

    });

  }


  function onTargetEnter(e) {

    if (!cursorRing) return;

    cursorRing.classList.add(
      'hovering'
    );

    snapTarget =
      e.currentTarget;

    const targetRadius =
      window.getComputedStyle(
        snapTarget
      ).borderRadius;

    cursorRing.style.borderRadius =
      targetRadius || '8px';

  }


  function onTargetLeave(e) {

    if (cursorRing) {

      cursorRing.classList.remove(
        'hovering'
      );

      snapTarget = null;

      cursorRing.style.borderRadius =
        '50%';

    }

    e.currentTarget.style.transform =
      '';

  }


  function onTargetMove(e) {

    if (!snapTarget) return;

    const rect =
      e.currentTarget.getBoundingClientRect();

    const x =
      e.clientX -
      rect.left -
      rect.width / 2;

    const y =
      e.clientY -
      rect.top -
      rect.height / 2;

    const moveX =
      Math.round(x * 0.15);

    const moveY =
      Math.round(y * 0.15);

    e.currentTarget.style.transform =
      `translate3d(
        ${moveX}px,
        ${moveY}px,
        0
      )`;

  }


  /* =========================
     SMOOTH SCROLLING
     ========================= */

  let scrollTarget = 0;
  let scrollCurrent = 0;
  let isScrolling = false;


  window.addEventListener(
    'wheel',
    (e) => {

      const activeView =
        document.querySelector(
          '.spa-view.active-view.scrollable-view'
        );

      if (!activeView) return;

      e.preventDefault();

      const arrowIcons =
        document.querySelectorAll(
          '.scroll-arrow-icon'
        );

      arrowIcons.forEach(
        arrow => {

          if (e.deltaY > 0) {

            arrow.style.transform =
              'rotate(0deg)';

          } else if (e.deltaY < 0) {

            arrow.style.transform =
              'rotate(180deg)';

          }

        }
      );

      const maxScroll =
        activeView.scrollHeight -
        activeView.clientHeight;

      scrollTarget +=
        e.deltaY * 0.8;

      scrollTarget =
        Math.max(
          -75,
          Math.min(
            scrollTarget,
            maxScroll + 75
          )
        );

      if (!isScrolling) {

        isScrolling = true;

        requestAnimationFrame(
          () =>
            smoothScrollLoop(
              activeView
            )
        );

      }

    },
    {
      passive: false
    }
  );


  function smoothScrollLoop(
    activeView
  ) {

    const maxScroll =
      activeView.scrollHeight -
      activeView.clientHeight;

    const isOverscrolled =
      scrollCurrent < 0 ||
      scrollCurrent > maxScroll;

    let friction = 0.08;

    if (isOverscrolled) {

      friction = 0.24;

      const boundedTarget =
        Math.max(
          0,
          Math.min(
            scrollTarget,
            maxScroll
          )
        );

      scrollTarget +=
        (boundedTarget - scrollTarget) *
        0.35;

    }

    scrollCurrent +=
      (scrollTarget - scrollCurrent) *
      friction;

    activeView.scrollTop =
      Math.max(
        0,
        Math.min(
          scrollCurrent,
          maxScroll
        )
      );

    if (scrollCurrent < 0) {

      activeView.style.transform =
        `translate3d(
          0,
          ${-scrollCurrent * 0.4}px,
          0
        )`;

    } else if (
      scrollCurrent > maxScroll
    ) {

      activeView.style.transform =
        `translate3d(
          0,
          ${(maxScroll - scrollCurrent) * 0.4}px,
          0
        )`;

    } else {

      activeView.style.transform =
        'translate3d(0, 0, 0)';

    }

    if (
      scrollCurrent <= 4 &&
      scrollTarget <= 0
    ) {

      const arrowIcons =
        document.querySelectorAll(
          '.scroll-arrow-icon'
        );

      arrowIcons.forEach(
        arrow => {

          arrow.style.transform =
            'rotate(0deg)';

        }
      );

    }


    if (activeView.id === 'blog') {

      checkBlogPortalThreshold();

    }


    const distanceToTarget =
      Math.abs(
        scrollTarget -
        scrollCurrent
      );

    if (
      distanceToTarget > 0.1 ||
      isOverscrolled
    ) {

      requestAnimationFrame(
        () =>
          smoothScrollLoop(
            activeView
          )
      );

    } else {

      scrollCurrent =
        Math.max(
          0,
          Math.min(
            scrollCurrent,
            maxScroll
          )
        );

      scrollTarget =
        scrollCurrent;

      activeView.style.transform =
        'translate3d(0, 0, 0)';

      isScrolling = false;

    }

  }


  /* =========================
     AUDIO
     ========================= */

  const AudioContext =
    window.AudioContext ||
    window.webkitAudioContext;

  let audioCtx = null;
  let masterGainNode = null;


  function initCentralAudioMixer() {

    if (audioCtx) return;

    try {

      audioCtx =
        new AudioContext();

      masterGainNode =
        audioCtx.createGain();

      masterGainNode.connect(
        audioCtx.destination
      );

      masterGainNode.gain.setValueAtTime(
        0.35,
        audioCtx.currentTime
      );

    } catch (e) {

      console.warn(
        'Central audio environment failed initialization:',
        e
      );

    }

  }


  function playDesktopClickHaptic(
    type = 'light'
  ) {

    initCentralAudioMixer();

    if (!audioCtx) return;

    try {

      if (
        audioCtx.state ===
        'suspended'
      ) {

        audioCtx.resume();

      }

      const osc =
        audioCtx.createOscillator();

      const localGainNode =
        audioCtx.createGain();

      osc.connect(
        localGainNode
      );

      localGainNode.connect(
        masterGainNode
      );

      const now =
        audioCtx.currentTime;


      if (type === 'light') {

        osc.type = 'sine';

        osc.frequency.setValueAtTime(
          1100,
          now
        );

        osc.frequency
          .exponentialRampToValueAtTime(
            350,
            now + 0.012
          );

        localGainNode.gain
          .setValueAtTime(
            0.08,
            now
          );

        localGainNode.gain
          .exponentialRampToValueAtTime(
            0.001,
            now + 0.012
          );

        osc.start(now);
        osc.stop(
          now + 0.012
        );


      } else if (
        type === 'medium'
      ) {

        osc.type = 'triangle';

        osc.frequency.setValueAtTime(
          750,
          now
        );

        osc.frequency
          .exponentialRampToValueAtTime(
            180,
            now + 0.025
          );

        localGainNode.gain
          .setValueAtTime(
            0.12,
            now
          );

        localGainNode.gain
          .exponentialRampToValueAtTime(
            0.001,
            now + 0.025
          );

        osc.start(now);
        osc.stop(
          now + 0.025
        );


      } else if (
        type === 'heavy'
      ) {

        osc.type = 'sine';

        osc.frequency.setValueAtTime(
          140,
          now
        );

        osc.frequency
          .exponentialRampToValueAtTime(
            45,
            now + 0.045
          );

        localGainNode.gain
          .setValueAtTime(
            0.35,
            now
          );

        localGainNode.gain
          .exponentialRampToValueAtTime(
            0.001,
            now + 0.045
          );

        osc.start(now);
        osc.stop(
          now + 0.045
        );

      }

    } catch (e) {

      console.log(
        'Haptic track skipped:',
        e
      );

    }

  }


  /* =========================
     CODE PAGE GRID
     ========================= */

  let canvas = null;
  let ctx = null;
  let points = [];
  let meshAnimationId = null;
  let resizeDebounceTimeout = null;

  const spacing = 45;


  function initMeshEngine() {

    canvas =
      document.getElementById(
        'mesh-canvas'
      );

    if (!canvas) return;

    ctx =
      canvas.getContext('2d');

    resizeMeshCanvas();

    window.removeEventListener(
      'resize',
      debouncedResizeHandler
    );

    window.addEventListener(
      'resize',
      debouncedResizeHandler
    );

    window.addEventListener(
      'mousemove',
      handleMeshInteraction
    );

    if (meshAnimationId) {

      cancelAnimationFrame(
        meshAnimationId
      );

    }

    animateMesh();

  }


  function debouncedResizeHandler() {

    if (resizeDebounceTimeout) {

      cancelAnimationFrame(
        resizeDebounceTimeout
      );

    }

    resizeDebounceTimeout =
      requestAnimationFrame(
        () => {

          resizeMeshCanvas();

        }
      );

  }


  function resizeMeshCanvas() {

    if (!canvas) return;

    const parent =
      canvas.parentElement;

    canvas.width =
      parent.clientWidth;

    canvas.height =
      parent.clientHeight;

    points = [];

    const cols =
      Math.ceil(
        canvas.width /
        spacing
      ) + 1;

    const rows =
      Math.ceil(
        canvas.height /
        spacing
      ) + 1;


    for (
      let y = 0;
      y < rows;
      y++
    ) {

      for (
        let x = 0;
        x < cols;
        x++
      ) {

        points.push({

          baseX:
            x * spacing,

          baseY:
            y * spacing,

          x:
            x * spacing,

          y:
            y * spacing,

          vx: 0,
          vy: 0

        });

      }

    }

  }


  function handleMeshInteraction(e) {

    if (
      !canvas ||
      document.body.getAttribute(
        'data-view'
      ) !== 'code'
    ) {

      return;

    }

    const rect =
      canvas.getBoundingClientRect();

    const mX =
      e.clientX -
      rect.left;

    const mY =
      e.clientY -
      rect.top;


    points.forEach(
      p => {

        const dx =
          mX - p.x;

        const dy =
          mY - p.y;

        const dist =
          Math.sqrt(
            dx * dx +
            dy * dy
          );

        const forceRadius =
          130;


        if (
          dist <
          forceRadius
        ) {

          const force =
            (forceRadius - dist) /
            forceRadius;

          const angle =
            Math.atan2(
              dy,
              dx
            );

          p.vx -=
            Math.cos(angle) *
            force *
            4;

          p.vy -=
            Math.sin(angle) *
            force *
            4;

        }

      }
    );

  }


  function animateMesh() {

    if (
      document.body.getAttribute(
        'data-view'
      ) !== 'code'
    ) {

      return;

    }

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );


    const cols =
      Math.ceil(
        canvas.width /
        spacing
      ) + 1;


    points.forEach(
      p => {

        const springK = 0.07;
        const damping = 0.82;

        const ax =
          (p.baseX - p.x) *
          springK;

        const ay =
          (p.baseY - p.y) *
          springK;

        p.vx =
          (p.vx + ax) *
          damping;

        p.vy =
          (p.vy + ay) *
          damping;

        p.x += p.vx;
        p.y += p.vy;

      }
    );


    ctx.strokeStyle =
      'rgba(229, 255, 222, 0.05)';

    ctx.lineWidth = 1;


    const rows =
      Math.ceil(
        canvas.height /
        spacing
      ) + 1;


    for (
      let y = 0;
      y < rows;
      y++
    ) {

      for (
        let x = 0;
        x < cols;
        x++
      ) {

        const index =
          y * cols + x;

        if (
          index >=
          points.length
        ) {

          continue;

        }

        const p =
          points[index];


        if (
          x <
          cols - 1 &&
          index + 1 <
          points.length
        ) {

          const rightP =
            points[index + 1];

          ctx.beginPath();

          ctx.moveTo(
            p.x,
            p.y
          );

          ctx.lineTo(
            rightP.x,
            rightP.y
          );

          ctx.stroke();

        }


        if (
          y <
          rows - 1 &&
          index + cols <
          points.length
        ) {

          const downP =
            points[
              index + cols
            ];

          ctx.beginPath();

          ctx.moveTo(
            p.x,
            p.y
          );

          ctx.lineTo(
            downP.x,
            downP.y
          );

          ctx.stroke();

        }

      }

    }


    meshAnimationId =
      requestAnimationFrame(
        animateMesh
      );

  }


  /* =========================
     VIEW SWITCHING
     ========================= */

  function switchView(
    targetId,
    updateHistory = true
  ) {

    const activeSection =
      document.querySelector(
        targetId
      );

    if (!activeSection) return;


    const executeViewSwapOps =
      () => {

        const viewName =
          targetId.replace(
            '#',
            ''
          );


        document.body.setAttribute(
          'data-view',
          viewName
        );

        document.body.setAttribute(
          'data-blog-theme',
          'default'
        );


        snapTarget = null;


        if (spaceTag) {

          if (
            viewName ===
            'blog'
          ) {

            spaceTag.textContent =
              'Feedback';

          } else if (
            viewName ===
            'journey'
          ) {

            spaceTag.textContent =
              'Chronicle Track';

          } else if (
            viewName ===
            'features'
          ) {

            spaceTag.textContent =
              'Features';

          } else if (
            viewName ===
            'neol'
          ) {

            spaceTag.textContent =
              'NEoL';

          } else {

            spaceTag.textContent =
              'Studio Archive';

          }

        }


        sections.forEach(
          section => {

            section.classList.remove(
              'active-view'
            );

            section.style.transform =
              'translate3d(0, 0, 0)';

            section.scrollTop = 0;

          }
        );


        scrollTarget = 0;
        scrollCurrent = 0;


        activeSection.classList.add(
          'active-view'
        );


        const arrowIcons =
          document.querySelectorAll(
            '.scroll-arrow-icon'
          );

        arrowIcons.forEach(
          arrow => {

            arrow.style.transform =
              'rotate(0deg)';

          }
        );


        if (meshAnimationId) {

          cancelAnimationFrame(
            meshAnimationId
          );

        }


        if (
          viewName ===
          'journey'
        ) {

          initTimelineMechanics();

        }


        if (
          viewName ===
          'code'
        ) {

          setTimeout(
            initMeshEngine,
            30
          );

        }


        applyMagneticBehaviors();


        navItems.forEach(
          item => {

            item.classList.remove(
              'active'
            );

            if (
              item.getAttribute(
                'href'
              ) === targetId
            ) {

              item.classList.add(
                'active'
              );

            }

          }
        );


        if (updateHistory) {

          history.pushState(
            { targetId },
            '',
            targetId
          );

        }

      };


    if (
      document.startViewTransition
    ) {

      document.startViewTransition(
        () => {

          executeViewSwapOps();

        }
      );

    } else {

      executeViewSwapOps();

    }

  }


  /* =========================
     NAV EVENTS
     ========================= */

  navItems.forEach(
    item => {

      item.addEventListener(
        'mousedown',
        () =>
          playDesktopClickHaptic(
            'light'
          )
      );


      item.addEventListener(
        'click',
        e => {

          e.preventDefault();

          switchView(
            item.getAttribute(
              'href'
            )
          );

        }
      );

    }
  );


  actionTriggers.forEach(
    btn => {

      btn.addEventListener(
        'mousedown',
        () =>
          playDesktopClickHaptic(
            'medium'
          )
      );


      btn.addEventListener(
        'click',
        e => {

          e.preventDefault();

          switchView(
            btn.getAttribute(
              'href'
            )
          );

        }
      );

    }
  );


  window.addEventListener(
    'popstate',
    e => {

      if (
        e.state &&
        e.state.targetId
      ) {

        switchView(
          e.state.targetId,
          false
        );

      } else if (
        window.location.hash
      ) {

        switchView(
          window.location.hash,
          false
        );

      }

    }
  );


  /* =========================
     JOURNEY TIMELINE
     ========================= */

  function initTimelineMechanics() {

    const activeJourneyView =
      document.getElementById(
        'journey'
      );

    if (!activeJourneyView) return;


    const nodes =
      activeJourneyView.querySelectorAll(
        '.timeline-node'
      );

    const liquidTrack =
      activeJourneyView.querySelector(
        '#liquid-track'
      );

    if (
      !nodes.length ||
      !liquidTrack
    ) {

      return;

    }


    function updateTrackFill() {

      const expandedNodes =
        activeJourneyView.querySelectorAll(
          '.timeline-node.node-expanded'
        );


      if (
        expandedNodes.length === 0
      ) {

        liquidTrack.style.height =
          '0%';

        return;

      }


      let highestPhase = 0;


      expandedNodes.forEach(
        node => {

          const phaseNum =
            parseInt(
              node.getAttribute(
                'data-phase'
              ),
              10
            );


          if (
            phaseNum >
            highestPhase
          ) {

            highestPhase =
              phaseNum;

          }

        }
      );


      const totalNodes =
        nodes.length;


      const targetPercent =
        (
          highestPhase /
          totalNodes
        ) * 100
        -
        (
          100 /
          totalNodes /
          2
        );


      liquidTrack.style.height =
        `${Math.max(
          20,
          targetPercent
        )}%`;

    }


    nodes.forEach(
      node => {

        const interactiveZone =
          node.querySelector(
            '.node-interactive-zone'
          );


        if (
          !interactiveZone ||
          interactiveZone.getAttribute(
            'data-bound'
          ) === 'true'
        ) {

          return;

        }


        interactiveZone.setAttribute(
          'data-bound',
          'true'
        );


        interactiveZone.addEventListener(
          'mousedown',
          () => {

            const isCurrentlyExpanded =
              node.classList.contains(
                'node-expanded'
              );


            if (
              !isCurrentlyExpanded
            ) {

              playDesktopClickHaptic(
                'heavy'
              );

            } else {

              playDesktopClickHaptic(
                'light'
              );

            }

          }
        );


        interactiveZone.addEventListener(
          'click',
          e => {

            e.stopPropagation();


            const isCurrentlyExpanded =
              node.classList.contains(
                'node-expanded'
              );


            nodes.forEach(
              otherNode =>
                otherNode.classList.remove(
                  'node-expanded'
                )
            );


            if (
              !isCurrentlyExpanded
            ) {

              node.classList.add(
                'node-expanded'
              );

            }


            updateTrackFill();

          }
        );

      }
    );

  }


  /* =========================
     FEEDBACK COLOUR CHANGE
     ========================= */

  const blogView =
    document.getElementById(
      'blog'
    );

  const portalTrigger =
    document.getElementById(
      'portal-trigger'
    );

  const portalText =
    document.getElementById(
      'portal-text'
    );

  let colorThresholdTripped = false;


  function checkBlogPortalThreshold() {

    if (!blogView) return;


    const maxScroll =
      blogView.scrollHeight -
      blogView.clientHeight;


    if (maxScroll <= 0) return;


    const halfwayPoint =
      maxScroll * 0.5;


    if (
      blogView.scrollTop >=
      halfwayPoint
    ) {

      if (!colorThresholdTripped) {

        playDesktopClickHaptic(
          'medium'
        );

        colorThresholdTripped =
          true;

      }


      document.body.setAttribute(
        'data-blog-theme',
        'shifted'
      );


      if (spaceTag) {

        spaceTag.textContent =
          'Second Half';

      }


      if (portalText) {

        portalText.textContent =
          'Halfway point';

      }

    } else {

      if (colorThresholdTripped) {

        playDesktopClickHaptic(
          'light'
        );

        colorThresholdTripped =
          false;

      }


      document.body.setAttribute(
        'data-blog-theme',
        'default'
      );


      if (spaceTag) {

        spaceTag.textContent =
          'Feedback';

      }


      if (portalText) {

        portalText.textContent =
          'Halfway point';

      }

    }

  }


  /* =========================
     SHINE EFFECT
     ========================= */

  document.body.addEventListener(
    'mousemove',
    e => {

      const target =
        e.target.closest(
          '.dynamic-shine'
        );

      if (!target) return;


      const rect =
        target.getBoundingClientRect();


      const x =
        e.clientX -
        rect.left;

      const y =
        e.clientY -
        rect.top;


      target.style.backgroundImage =
        `radial-gradient(
          circle 280px at ${x}px ${y}px,
          rgba(255, 255, 255, 0.08),
          transparent 100%
        )`;

    }
  );


  document.body.addEventListener(
    'mouseout',
    e => {

      const target =
        e.target.closest(
          '.dynamic-shine'
        );

      if (target) {

        target.style.backgroundImage =
          'none';

      }

    }
  );


  /* =========================
     NAV SHINE
     ========================= */

  const liquidNav =
    document.getElementById(
      'main-nav'
    );


  if (liquidNav) {

    liquidNav.addEventListener(
      'mousemove',
      e => {

        const rect =
          liquidNav.getBoundingClientRect();


        const x =
          e.clientX -
          rect.left;

        const y =
          e.clientY -
          rect.top;


        liquidNav.style.backgroundImage =
          `radial-gradient(
            circle 150px at ${x}px ${y}px,
            rgba(255, 255, 255, 0.07),
            rgba(255, 255, 255, 0.01) 60%,
            transparent 100%
          )`;

      }
    );


    liquidNav.addEventListener(
      'mouseleave',
      () => {

        liquidNav.style.backgroundImage =
          'none';

      }
    );

  }


  /* =========================
   NEoL IMAGE LIGHTBOX
   ========================= */

const neolImages =
  document.querySelectorAll('.neol-zoomable');

let imageLightbox = null;
let imageLightboxImage = null;
let imageLightboxClose = null;


/* Create the lightbox once */

function createImageLightbox() {

  if (imageLightbox) return;

  imageLightbox =
    document.createElement('div');

  imageLightbox.className =
    'image-lightbox';

  imageLightbox.id =
    'image-lightbox';


  imageLightbox.innerHTML = `
    <button
      class="image-lightbox-close"
      id="image-lightbox-close"
      aria-label="Close image"
    >
      ×
    </button>

    <img
      id="image-lightbox-image"
      src=""
      alt=""
    >

    <div class="image-lightbox-hint">
      Click outside or press × to close
    </div>
  `;


  document.body.appendChild(
    imageLightbox
  );


  imageLightboxImage =
    imageLightbox.querySelector(
      '#image-lightbox-image'
    );


  imageLightboxClose =
    imageLightbox.querySelector(
      '#image-lightbox-close'
    );


  imageLightboxClose.addEventListener(
    'click',
    closeImageLightbox
  );


  imageLightbox.addEventListener(
    'click',
    (e) => {

      if (
        e.target ===
        imageLightbox
      ) {

        closeImageLightbox();

      }

    }
  );

}


function openImageLightbox(image) {

  createImageLightbox();

  if (
    !imageLightbox ||
    !imageLightboxImage
  ) {
    return;
  }


  imageLightboxImage.src =
    image.src;

  imageLightboxImage.alt =
    image.alt || '';


  imageLightbox.classList.add(
    'active'
  );


  playDesktopClickHaptic(
    'light'
  );

}


function closeImageLightbox() {

  if (!imageLightbox) {
    return;
  }


  imageLightbox.classList.remove(
    'active'
  );


  setTimeout(
    () => {

      if (imageLightboxImage) {

        imageLightboxImage.src =
          '';

      }

    },
    300
  );

}


/* Make every NEoL image clickable */

neolImages.forEach(
  image => {

    image.addEventListener(
      'click',
      () => {

        openImageLightbox(
          image
        );

      }
    );

  }
);


/* Escape closes the image */

document.addEventListener(
  'keydown',
  (e) => {

    if (
      e.key === 'Escape' &&
      imageLightbox &&
      imageLightbox.classList.contains(
        'active'
      )
    ) {

      closeImageLightbox();

    }

  }
);


  /* =========================
     IMAGE LIGHTBOX HTML
     ========================= */

  if (!document.getElementById(
    'image-lightbox'
  )) {

    const lightbox =
      document.createElement(
        'div'
      );

    lightbox.className =
      'image-lightbox';

    lightbox.id =
      'image-lightbox';


    lightbox.innerHTML = `
      <button
        class="image-lightbox-close"
        id="image-lightbox-close"
        aria-label="Close image"
      >
        ×
      </button>

      <img
        id="image-lightbox-image"
        src=""
        alt=""
      >

      <div class="image-lightbox-hint">
        Click outside or press × to close
      </div>
    `;


    document.body.appendChild(
      lightbox
    );

  }


  /* =========================
     START
     ========================= */

  const initialHash =
    window.location.hash ||
    '#home';


  switchView(
    initialHash,
    true
  );

});