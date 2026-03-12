import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { RoleSelection } from "./pages/RoleSelection";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { OTPVerification } from "./pages/OTPVerification";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ForgotPasswordOTP } from "./pages/ForgotPasswordOTP";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { DonorProfileSetup } from "./pages/DonorProfileSetup";
import { DonorDashboard } from "./pages/DonorDashboard";
import { NearbyBloodRequests } from "./pages/NearbyBloodRequests";
import { DonorRequirements } from "./pages/DonorRequirements";
import { EligibilityCheck } from "./pages/EligibilityCheck";
import { BookAppointment } from "./pages/BookAppointment";
import { AppointmentConfirmation } from "./pages/AppointmentConfirmation";
import { PatientDashboard } from "./pages/PatientDashboard";
import { MatchedDonors } from "./pages/MatchedDonors";
import { NearbyHospitals } from "./pages/NearbyHospitals";
import { EmergencyBloodRequest } from "./pages/EmergencyBloodRequest";
import { DonorMapPage } from "./pages/DonorMapPage";
import { LiveRequestTracking } from "./pages/LiveRequestTracking";
import { ChatPage } from "./pages/ChatPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { DonationHistory } from "./pages/DonationHistory";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/role-selection",
    Component: RoleSelection,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/signup",
    Component: SignupPage,
  },
  {
    path: "/otp-verification",
    Component: OTPVerification,
  },
  {
    path: "/forgot-password",
    Component: ForgotPasswordPage,
  },
  {
    path: "/forgot-password-otp",
    Component: ForgotPasswordOTP,
  },
  {
    path: "/reset-password",
    Component: ResetPasswordPage,
  },
  {
    path: "/donor-profile-setup",
    Component: DonorProfileSetup,
  },
  {
    path: "/donor-dashboard",
    Component: DonorDashboard,
  },
  {
    path: "/nearby-blood-requests",
    Component: NearbyBloodRequests,
  },
  {
    path: "/donor-requirements",
    Component: DonorRequirements,
  },
  {
    path: "/eligibility-check",
    Component: EligibilityCheck,
  },
  {
    path: "/book-appointment",
    Component: BookAppointment,
  },
  {
    path: "/appointment-confirmation",
    Component: AppointmentConfirmation,
  },
  {
    path: "/patient-dashboard",
    Component: PatientDashboard,
  },
  {
    path: "/matched-donors",
    Component: MatchedDonors,
  },
  {
    path: "/nearby-hospitals",
    Component: NearbyHospitals,
  },
  {
    path: "/emergency-blood-request",
    Component: EmergencyBloodRequest,
  },
  {
    path: "/donor-map",
    Component: DonorMapPage,
  },
  {
    path: "/live-tracking",
    Component: LiveRequestTracking,
  },
  {
    path: "/chat",
    Component: ChatPage,
  },
  {
    path: "/notifications",
    Component: NotificationsPage,
  },
  {
    path: "/settings",
    Component: SettingsPage,
  },
  {
    path: "/donation-history",
    Component: DonationHistory,
  },
]);