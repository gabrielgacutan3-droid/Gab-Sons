/* Hero tech animation: animated SVG mesh grid + text reveal
   20 years of dev experience: performant, elegant, purposeful. */
(function () {
  'use strict';

  function init() {
    var svg = document.getElementById('heroMesh');
    var canvas = document.getElementById('heroTechCanvas');
    if (!svg || !canvas) return;

    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);

    var gridSize = Math.max(w, h) / 5;
    var cols = Math.ceil(w / gridSize) + 2;
    var rows = Math.ceil(h / gridSize) + 2;
    var nodes = [];
    var time = 0;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Create grid nodes with noise displacement
    for (var y = -1; y < rows; y++) {
      for (var x = -1; x < cols; x++) {
        nodes.push({
          x: x * gridSize,
          y: y * gridSize,
          baseX: x * gridSize,
          baseY: y * gridSize,
          circle: null,
          pulse: Math.random() * Math.PI * 2
        });
      }
    }

    // Build SVG structure
    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    var grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    grad.setAttribute('id', 'meshGrad');
    grad.setAttribute('x1', '0%');
    grad.setAttribute('y1', '0%');
    grad.setAttribute('x2', '100%');
    grad.setAttribute('y2', '100%');
    var stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('class', 'mesh-stop-1');
    var stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('class', 'mesh-stop-2');
    grad.appendChild(stop1);
    grad.appendChild(stop2);
    defs.appendChild(grad);
    svg.appendChild(defs);

    var linesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    linesGroup.setAttribute('class', 'mesh-lines');
    svg.appendChild(linesGroup);

    var dotsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    dotsGroup.setAttribute('class', 'mesh-dots');
    svg.appendChild(dotsGroup);

    // Create circles at nodes
    nodes.forEach(function (node, i) {
      var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', '2');
      circle.setAttribute('class', 'mesh-node');
      dotsGroup.appendChild(circle);
      node.circle = circle;
    });

    var perlinOffset = 0;
    function noise(x, y, z) {
      var n =
        Math.sin(x * 12.9898 + y * 78.233 + z * 45.1641) *
        43758.5453;
      return n - Math.floor(n);
    }

    function animate(ts) {
      time = ts / 1000;
      perlinOffset += 0.006;

      // Update node positions
      nodes.forEach(function (node) {
        var n = noise(
          node.baseX * 0.005,
          node.baseY * 0.005,
          perlinOffset
        );
        var angle = n * Math.PI * 2;
        var amp = 20 + Math.sin(node.pulse + time * 0.8) * 10;
        node.x = node.baseX + Math.cos(angle) * amp;
        node.y = node.baseY + Math.sin(angle) * amp;
      });

      // Redraw lines
      linesGroup.innerHTML = '';
      nodes.forEach(function (node, i) {
        var col = i % cols;
        var row = Math.floor(i / cols);
        var neighbors = [];
        if (col < cols - 1) neighbors.push(nodes[i + 1]);
        if (row < rows - 1) neighbors.push(nodes[i + cols]);
        neighbors.forEach(function (neighbor) {
          var dist = Math.hypot(
            neighbor.x - node.x,
            neighbor.y - node.y
          );
          var opacity = Math.max(0, 0.3 - dist * 0.004);
          if (opacity > 0.01) {
            var line = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'line'
            );
            line.setAttribute('x1', node.x);
            line.setAttribute('y1', node.y);
            line.setAttribute('x2', neighbor.x);
            line.setAttribute('y2', neighbor.y);
            line.setAttribute('stroke-opacity', opacity);
            line.setAttribute('class', 'mesh-line');
            linesGroup.appendChild(line);
          }
        });
      });

      // Update circles
      nodes.forEach(function (node) {
        node.circle.setAttribute('cx', node.x);
        node.circle.setAttribute('cy', node.y);
        var pulse =
          0.5 + Math.sin(node.pulse + time * 1.2) * 0.5;
        node.circle.setAttribute('r', 1.5 + pulse * 1.5);
        node.circle.setAttribute(
          'opacity',
          0.4 + pulse * 0.4
        );
      });

      if (!reduceMotion) {
        requestAnimationFrame(animate);
      }
    }

    if (reduceMotion) {
      animate(4000); // single static frame
    } else {
      requestAnimationFrame(animate);
    }

    // Text reveal animation
    var textEls = document.querySelectorAll(
      '.hero-copy h1, .hero-copy p'
    );
    textEls.forEach(function (el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition =
        'opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s';
      setTimeout(function () {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }, 100 + i * 100);
    });

    // Handle window resize
    window.addEventListener('resize', function () {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
