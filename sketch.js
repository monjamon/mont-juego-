
/*
  Simulador de Lentes Delgados (Thin Lens)
  Usa p5.js para renderizar la óptica geométrica.
*/

let isConverging = true; // true = Convergente, false = Divergente
let f = 150; // Distancia focal (px)
let objH = -80; // Altura del objeto (negativo es hacia arriba en p5 por defecto, pero ajustaremos coordenadas)

function setup() {
  // Crear lienzo y ponerlo dentro del div del HTML
  let canvas = createCanvas(800, 500);
  canvas.parent('canvas-container');
  textSize(14);
}

function draw() {
  background(30);
  
  // 1. Configurar sistema de coordenadas
  // Movemos el origen (0,0) al centro de la pantalla
  translate(width / 2, height / 2);
  
  // El eje Y en computación es positivo hacia abajo.
  // Para física, invertimos esto para que 'arriba' sea positivo visualmente si lo prefieres,
  // pero mantendremos el estándar de computación para simplificar el texto.
  
  // Variables dinámicas basadas en el mouse
  // El mouseX es relativo al canvas (0 a 800). Lo ajustamos al centro.
  let mouseXAdjusted = mouseX - width / 2;
  
  // Posición del objeto (distancia d_o). Limitamos para que no cruce la lente drásticamente
  let do_pos = constrain(mouseXAdjusted, -width/2 + 20, -10); 
  
  // Ajustar foco según tipo de lente
  let currentF = isConverging ? f : -f;

  // --- DIBUJAR ELEMENTOS ESTÁTICOS ---
  drawOpticalAxis();
  drawLens(isConverging);
  drawFocalPoints(currentF);

  // --- CÁLCULOS ÓPTICOS ---
  // Ecuación de lentes delgadas: 1/f = 1/do + 1/di  =>  di = (f * do) / (do - f)
  // Nota: En nuestro sistema de coordenadas, el objeto está en X negativo.
  // La fórmula estándar asume distancias positivas. Usaremos coordenadas directas.
  
  // U: Posición objeto (negativa), F: Foco (pos/neg)
  // V: Posición imagen = (1 / ((1/f) - (1/u))) 
  // Simplificado: V = (f * u) / (u - f)
  
  let u = do_pos; 
  let v = (currentF * u) / (u - currentF); // Posición X de la imagen
  
  // Magnificación M = v / u  (o -di/do)
  let m = v / u;
  let imgH = objH * m;

  // --- DIBUJAR OBJETO E IMAGEN ---
  drawArrow(u, objH, "Objeto", color(100, 200, 255)); // Azul
  drawArrow(v, imgH, "Imagen", color(255, 100, 100)); // Rojo

  // --- TRAZADO DE RAYOS (RAY TRACING) ---
  strokeWeight(2);
  
  // Rayo 1: Paralelo al eje -> Se refracta pasando por el foco
  stroke(255, 255, 0, 200); // Amarillo
  line(u, objH, 0, objH); // Del objeto a la lente
  
  if (isConverging) {
    // Pasa por el foco real (derecha)
    drawLineExtended(0, objH, currentF, 0);
  } else {
    // Diverge como si viniera del foco virtual (izquierda)
    // Dibujamos linea solida hacia afuera
    let slope = (objH - 0) / (0 - currentF); // Pendiente desde foco virtual
    line(0, objH, width/2, objH + slope * (width/2));
    // Línea punteada hacia atrás (virtual)
    drawDashedLine(currentF, 0, 0, objH);
  }

  // Rayo 2: Pasa por el centro óptico (0,0) -> No se desvía
  stroke(0, 255, 0, 150); // Verde
  // Dibujamos una línea larga que pase por (u, objH) y (0,0)
  // y=mx+b, b=0.
  let slopeCenter = objH / u;
  line(u, objH, -u * 10, -objH * 10); // Lado izquierdo
  line(u, objH, width, width * slopeCenter); // Lado derecho

  // Rayo 3: Pasa por el foco objeto -> Se refracta paralelo
  // Este es más complejo visualmente para lentes divergentes, lo simplificamos
  // para mantener la claridad del dibujo. Si es convergente:
  if (isConverging) {
      stroke(255, 0, 255, 150); // Magenta
      line(u, objH, -currentF, 0); // Pasa por foco izq hasta eje? No, hasta lente
      // Calculamos donde golpea la lente
      // Pendiente m = (0 - objH) / (-currentF - u)
      // Y en x=0? 
      let m3 = (0 - objH) / (-currentF - u);
      let yIntercept = objH + m3 * (0 - u);
      
      line(u, objH, 0, yIntercept); // Objeto a Lente
      line(0, yIntercept, width/2, yIntercept); // Lente sale paralelo
  }

  // Información en texto
  fill(255);
  noStroke();
  text(`Tipo: ${isConverging ? "Convergente" : "Divergente"}`, -width/2 + 20, -height/2 + 30);
  text(`Distancia Objeto (do): ${Math.abs(u).toFixed(0)}`, -width/2 + 20, -height/2 + 50);
  text(`Distancia Imagen (di): ${Math.abs(v).toFixed(0)}`, -width/2 + 20, -height/2 + 70);
}

// --- FUNCIONES AUXILIARES ---

function drawOpticalAxis() {
  stroke(150);
  strokeWeight(1);
  line(-width / 2, 0, width / 2, 0);
  
  // Línea vertical de la lente
  stroke(200);
  line(0, -height / 2, 0, height / 2);
}

function drawFocalPoints(fLen) {
  fill(255);
  noStroke();
  ellipse(fLen, 0, 8, 8);  // Foco derecho
  ellipse(-fLen, 0, 8, 8); // Foco izquierdo
  text("F", fLen - 5, 20);
  text("F'", -fLen - 5, 20);
}

function drawLens(converging) {
  noFill();
  stroke(255);
  strokeWeight(3);
  let h = 200; // Altura visual de la lente
  
  // Dibujo esquemático
  line(0, -h/2, 0, h/2);
  
  if (converging) {
    // Flechas normales (apuntan afuera)
    line(0, -h/2, -10, -h/2 + 10);
    line(0, -h/2, 10, -h/2 + 10);
    line(0, h/2, -10, h/2 - 10);
    line(0, h/2, 10, h/2 - 10);
  } else {
    // Flechas invertidas (apuntan adentro/V shape)
    line(0, -h/2, -10, -h/2 - 10);
    line(0, -h/2, 10, -h/2 - 10);
    line(0, h/2, -10, h/2 + 10);
    line(0, h/2, 10, h/2 + 10);
  }
}

function drawArrow(x, h, label, col) {
  stroke(col);
  strokeWeight(4);
  line(x, 0, x, h); // Tallo de la flecha
  
  // Cabeza de la flecha
  let arrowSize = 10;
  // Dirección de la cabeza depende si h es positivo o negativo
  let dir = h < 0 ? -1 : 1; 
  line(x, h, x - 5, h - (dir * 5));
  line(x, h, x + 5, h - (dir * 5));

  noStroke();
  fill(col);
  text(label, x - 15, h - (dir * 15));
}

// Función para dibujar una línea que se extiende hasta el borde
function drawLineExtended(x1, y1, x2, y2) {
    let slope = (y2 - y1) / (x2 - x1);
    let intercept = y1 - slope * x1;
    line(x1, y1, width, slope * width + intercept);
}

// Función manual para líneas punteadas
function drawDashedLine(x1, y1, x2, y2) {
    let d = dist(x1, y1, x2, y2);
    let parts = d / 10;
    for (let i = 0; i < parts; i+=2) {
        let lerpX = lerp(x1, x2, i/parts);
        let lerpY = lerp(y1, y2, i/parts);
        let lerpX2 = lerp(x1, x2, (i+1)/parts);
        let lerpY2 = lerp(y1, y2, (i+1)/parts);
        line(lerpX, lerpY, lerpX2, lerpY2);
    }
}

// Función controlada por el botón HTML
function toggleLens() {
    isConverging = !isConverging;
}
