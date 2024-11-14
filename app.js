// Получаем элементы видео и canvas из HTML
const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('outputCanvas');
const canvasCtx = canvasElement.getContext('2d');

// Устанавливаем Mediapipe Pose
const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

// Обработчик результатов Pose
pose.onResults(onResults);

// Настраиваем камеру
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await pose.send({ image: videoElement });
  },
  width: 640,
  height: 480
});
camera.start();

// Счётчик отжиманий и флаг положения
let isDown = false;
let pushUpCount = 0;
const pushUpCountDisplay = document.getElementById('pushUpCountDisplay');
const smileDisplay = document.getElementById('smileDisplay');
// Функция для обнаружения отжиманий


// const faceMesh = new FaceMesh({
//     locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
//   });
  
//   faceMesh.setOptions({
//     maxNumFaces: 1,
//     refineLandmarks: true,
//     minDetectionConfidence: 0.5,
//     minTrackingConfidence: 0.5
//   });
  
//   faceMesh.onResults(onFaceResults);

//   const faceCamera = new Camera(videoElement, {
//     onFrame: async () => {
//       await faceMesh.send({ image: videoElement });
//     },
//     width: 640,
//     height: 480
//   });
//   faceCamera.start();
  
//   function detectSmile(landmarks) {
//     // Координаты для проверки улыбки
//     const leftMouthCorner = landmarks[61];
//     const rightMouthCorner = landmarks[291];
//     const upperLip = landmarks[13];
//     const lowerLip = landmarks[14];
  
//     // Вычисление расстояний для определения улыбки
//     const mouthWidth = Math.hypot(rightMouthCorner.x - leftMouthCorner.x, rightMouthCorner.y - leftMouthCorner.y);
//     const mouthHeight = Math.hypot(upperLip.x - lowerLip.x, upperLip.y - lowerLip.y);
  
//     // Проверка условия улыбки: если ширина рта намного больше высоты
//     if (mouthWidth > 2 * mouthHeight) {
//       smileDisplay.textContent = 'Smile detected: Yes';
//     } else {
//       smileDisplay.textContent = 'Smile detected: No';
//     }
//   }
  
//   function onFaceResults(results) {
//     canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
//     canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
  
//     if (results.multiFaceLandmarks) {
//       for (const landmarks of results.multiFaceLandmarks) {
//         drawConnectors(canvasCtx, landmarks, FaceMesh.FACEMESH_LIPS, { color: '#FF0000', lineWidth: 2 });
//         drawLandmarks(canvasCtx, landmarks, { color: '#00FF00', lineWidth: 1 });
  
//         // Определение улыбки
//         detectSmile(landmarks);
//       }
//     }
//   }

function detectPushUp(landmarks) {
    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
  
    const shoulderY = leftShoulder.y;
    const elbowY = leftElbow.y;
  
    if (shoulderY > elbowY && !isDown) {
      isDown = true;
    } else if (shoulderY < elbowY && isDown) {
      isDown = false;
      pushUpCount += 1;
      pushUpCountDisplay.textContent = `Push-ups: ${pushUpCount}`;
    }
}

// Функция для обработки и отображения результатов
function onResults(results) {
  // Очистка canvas и отображение видеопотока
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  // Если ключевые точки обнаружены, рисуем скелет и отслеживаем отжимания
  if (results.poseLandmarks) {
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
                   { color: '#00FF00', lineWidth: 4 });
    drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });

    // Обнаружение отжиманий
    detectPushUp(results.poseLandmarks);
  }
}
