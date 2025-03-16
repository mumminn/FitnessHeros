import { createBrowserRouter } from "react-router-dom";
import React from "react";
import { routes } from "../constants/routes";
import MainPage from "../pages/main/page";
import LoginPage from "../pages/login/page";
import SignUpPage from "../pages/signup/page";
import OnBoardingPage from "../pages/onBoarding/page";
import MenuPage from "../pages/menu/page";
import StoryPage from "../pages/story/page";
import EpisodePage from "../pages/story/episode/page";
import ExerciseStartPage from "../pages/story/exerciseStart/page";
import FocusPage from "../pages/focus/page";
import FriendPage from "../pages/friend/page";
import ChallengeStartPage from "../pages/friend/challengeStart/page";
import CharacterPage from "../pages/character/page";
import StorePage from "../pages/store/page";
import MypagePage from "../pages/mypage/page";
import TutorialPage from "../pages/tutorial/page";

const router = createBrowserRouter([
  {
    path: routes.main,
    element: <MainPage />,
  },
  {
    path: routes.signup,
    element: <SignUpPage />,
  },
  {
    path: routes.login,
    element: <LoginPage />,
  },
  {
    path: routes.onboarding,
    element: <OnBoardingPage />,
  },
  {
    path: routes.menu,
    element: <MenuPage />,
  },
  {
    path: routes.story,
    element: <StoryPage />,
  },
  {
    path: routes.episode,
    element: <EpisodePage />,
  },
  {
    path: routes.exercise,
    element: <ExerciseStartPage />,
  },
  {
    path: routes.focus,
    element: <FocusPage />,
  },
  {
    path: routes.friend,
    element: <FriendPage />,
  },
  {
    path: routes.challengeStart,
    element: <ChallengeStartPage />,
  },
  {
    path: routes.character,
    element: <CharacterPage />,
  },
  {
    path: routes.store,
    element: <StorePage />,
  },
  {
    path: routes.mypage,
    element: <MypagePage />,
  },
  {
    path: routes.tutorial,
    element: <TutorialPage />,
  },
]);

export default router;
