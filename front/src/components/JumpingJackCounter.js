import React, { useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs"; // TensorFlow.js
import * as posedetection from "@tensorflow-models/pose-detection"; // MoveNet 라이브러리
import "@tensorflow/tfjs-backend-webgl"; // WebGL 백엔드

function JumpingJackCounter({ videoRef, onCountIncrease }) {
  const detectorRef = useRef(null);
  let isJumping = false;

  useEffect(() => {
    const setupBackend = async () => {
      await tf.setBackend("webgl");
      await tf.ready();
    };

    const loadModel = async () => {
      try {
        const detector = await posedetection.createDetector(
          posedetection.SupportedModels.MoveNet,
          {
            modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          }
        );
        detectorRef.current = detector;
        console.log("MoveNet 모델 로드 성공");
      } catch (error) {
        console.error("MoveNet 모델 로드 실패:", error);
      }
    };

    setupBackend().then(() => loadModel());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      detectPose();
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const detectPose = async () => {
    if (
      videoRef.current &&
      // videoRef.current.readyState === 4 // 원래거
      (videoRef.current.video
        ? videoRef.current.video.readyState
        : videoRef.current.readyState) === 4 &&
      detectorRef.current
    ) {
      // const video = videoRef.current; // 원래거
      const video = videoRef.current.video // react-webcam 사용 시
        ? videoRef.current.video // react-webcam 내부의 video
        : videoRef.current; // 일반 video 태그 직접 참조

      const poses = await detectorRef.current.estimatePoses(video, {
        maxPoses: 1,
        flipHorizontal: false,
      });

      if (poses && poses.length > 0) {
        const pose = poses[0];
        processPose(pose);
      }
    }
  };

  const processPose = (pose) => {
    const keypoints = pose.keypoints.filter((kp) =>
      [
        "left_ankle",
        "right_ankle",
        "left_wrist",
        "right_wrist",
        "left_shoulder",
        "right_shoulder",
        "nose",
      ].includes(kp.name)
    );

    // 관절 좌표 및 신뢰도 확인
    const leftAnkle = keypoints.find(
      (kp) => kp.name === "left_ankle" && kp.score > 0.5
    );
    const rightAnkle = keypoints.find(
      (kp) => kp.name === "right_ankle" && kp.score > 0.5
    );
    const leftWrist = keypoints.find(
      (kp) => kp.name === "left_wrist" && kp.score > 0.5
    );
    const rightWrist = keypoints.find(
      (kp) => kp.name === "right_wrist" && kp.score > 0.5
    );
    const leftShoulder = keypoints.find(
      (kp) => kp.name === "left_shoulder" && kp.score > 0.5
    );
    const rightShoulder = keypoints.find(
      (kp) => kp.name === "right_shoulder" && kp.score > 0.5
    );
    const nose = keypoints.find((kp) => kp.name === "nose" && kp.score > 0.5);

    if (
      leftAnkle &&
      rightAnkle &&
      leftWrist &&
      rightWrist &&
      leftShoulder &&
      rightShoulder &&
      nose
    ) {
      // 발목 사이 거리와 어깨 사이 거리 계산
      const ankleDistance = Math.abs(rightAnkle.x - leftAnkle.x);
      const shoulderDistance = Math.abs(rightShoulder.x - leftShoulder.x);

      // 점프 감지: 발목 사이의 거리가 어깨보다 크고 손목이 머리 위에 있는 경우
      if (
        ankleDistance > shoulderDistance &&
        leftWrist.y < nose.y &&
        rightWrist.y < nose.y &&
        !isJumping // 이미 점프 상태가 아닌 경우만
      ) {
        isJumping = true;
        console.log("점프 감지");
      }

      // 착지 감지: 발목 사이의 거리가 어깨보다 작고 손목이 어깨 아래로 내려간 경우
      if (
        ankleDistance <= shoulderDistance &&
        isJumping &&
        leftWrist.y > leftShoulder.y && // 손목이 어깨 아래로 내려감
        rightWrist.y > rightShoulder.y
      ) {
        onCountIncrease(); // 부모 컴포넌트로 카운트 증가 이벤트 전달
        isJumping = false;
        console.log("착지 감지");
      }
    }
  };

  return null; // 캔버스를 렌더링하지 않음
}

export default JumpingJackCounter;
