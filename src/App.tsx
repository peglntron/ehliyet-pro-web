import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect } from 'react';
import theme from './theme';
import MainLayout from './layouts/MainLayout';
import { AuthProvider } from './contexts/AuthContext';
import { SnackbarProvider } from './contexts/SnackbarContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Dashboard from './features/dashboard/Dashboard';
import QuestionList from './features/questions/QuestionList';
import AddEditQuestion from './features/questions/AddQuestion';
import LessonList from './features/lessons/LessonList';
import AddEditUnitNew from './features/lessons/AddEditUnitNew';
import AddEditUnitContent from './features/lessons/AddEditUnitContent';
import ViewUnitContent from './features/lessons/ViewUnitContent';
import LessonsManagement from './features/lessons/LessonsManagement';
import AddEditLesson from './features/lessons/AddEditLesson';
import TrafficSignList from './features/traffic-signs/TrafficSignList';
import AddEditTrafficSign from './features/traffic-signs/AddEditTrafficSign';
import LicenseClassList from './features/license-classes/LicenseClassList';
import AddEditLicenseClass from './features/license-classes/AddEditLicenseClass';
import CompanyList from './features/company/CompanyList';

import AddEditCompany from './features/company/AddEditCompany';
import AddCompany from './features/company/AddCompany';
import CompanyDetail from './features/company/CompanyDetail';
import CompanyDashboard from './features/company/CompanyDashboard';
import Reports from './features/reports/Reports';
import { NavbarProvider } from './contexts/NavbarContext';
import NotFoundPage from './pages/NotFoundPage';
import SettingsPage from './pages/SettingsPage';
import LiveActivitiesPage from './pages/LiveActivitiesPage';
import StudentList from './features/students/StudentList';
import AddEditStudent from './features/students/AddEditStudent';
import StudentDetail from './features/students/StudentDetail';
import InstructorList from './features/instructors/InstructorList';
import CompanyInfoPage from './pages/CompanyInfoPage';
import InstructorDetail from './features/instructors/InstructorDetail';
import VehicleList from './features/vehicles/VehicleList';
import AddEditVehicle from './features/vehicles/AddEditVehicle';
import VehicleDetail from './features/vehicles/VehicleDetail';
import NotificationsList from './features/notifications/NotificationsList';
import StudentInstructorMatching from './features/matching/StudentInstructorMatching';
import SavedMatchingsList from './features/matching/components/SavedMatchingsList';
import SavedMatchingDetail from './features/matching/components/SavedMatchingDetail';
import OverduePaymentsList from './features/payments/OverduePaymentsList';
import ExpenseCategoriesPage from "./features/expenses/ExpenseCategoriesPage";
import ExpensesPage from "./features/expenses/ExpensesPage";
import InstructorProfilePage from './pages/InstructorProfilePage';
import AdminProfilePage from './pages/AdminProfilePage';
import CompanyAdminProfilePage from './pages/CompanyAdminProfilePage';
import DrivingLessonsPage from './pages/DrivingLessonsPage';
import InstructorDashboardPage from './pages/InstructorDashboardPage';

function App() {
  // Number input scroll engellemesi - global
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'number') {
        e.preventDefault();
        target.blur(); // Focus'u kaldır
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <PermissionsProvider>
          <SnackbarProvider>
            <NavbarProvider>
              <Router>
                <Routes>
              {/* Login sayfası */}
              <Route path="/login" element={<LoginPage />} />
            {/* Ana uygulama rotaları */}
            <Route path="/" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
            <Route path="/live-activities" element={<ProtectedRoute><MainLayout><LiveActivitiesPage /></MainLayout></ProtectedRoute>} />
            <Route path="/questions" element={<ProtectedRoute><MainLayout><QuestionList /></MainLayout></ProtectedRoute>} />
            <Route path="/questions/add" element={<ProtectedRoute><MainLayout><AddEditQuestion /></MainLayout></ProtectedRoute>} />
            <Route path="/questions/edit/:id" element={<ProtectedRoute><MainLayout><AddEditQuestion /></MainLayout></ProtectedRoute>} />
            
            {/* Ders Yönetimi rotaları */}
            <Route path="/lessons-management" element={<ProtectedRoute><MainLayout><LessonsManagement /></MainLayout></ProtectedRoute>} />
            <Route path="/lessons-management/add" element={<ProtectedRoute><MainLayout><AddEditLesson /></MainLayout></ProtectedRoute>} />
            <Route path="/lessons-management/edit/:id" element={<ProtectedRoute><MainLayout><AddEditLesson /></MainLayout></ProtectedRoute>} />
            
            {/* Ünite Yönetimi rotaları */}
            <Route path="/lessons" element={<ProtectedRoute><MainLayout><LessonList /></MainLayout></ProtectedRoute>} />
            <Route path="/lessons/add" element={<ProtectedRoute><MainLayout><AddEditUnitNew /></MainLayout></ProtectedRoute>} />
            <Route path="/lessons/edit/:id" element={<ProtectedRoute><MainLayout><AddEditUnitNew /></MainLayout></ProtectedRoute>} />
            
            {/* Ünite İçeriği rotaları */}
            <Route path="/units/:unitId/contents/add" element={<ProtectedRoute><MainLayout><AddEditUnitContent /></MainLayout></ProtectedRoute>} />
            <Route path="/units/:unitId/contents/edit/:contentId" element={<ProtectedRoute><MainLayout><AddEditUnitContent /></MainLayout></ProtectedRoute>} />
            <Route path="/units/contents/view/:id" element={<ProtectedRoute><MainLayout><ViewUnitContent /></MainLayout></ProtectedRoute>} />
            
            {/* Trafik İşaretleri rotaları */}
            <Route path="/traffic-signs" element={<ProtectedRoute><MainLayout><TrafficSignList /></MainLayout></ProtectedRoute>} />
            <Route path="/traffic-signs/add" element={<ProtectedRoute><MainLayout><AddEditTrafficSign /></MainLayout></ProtectedRoute>} />
            <Route path="/traffic-signs/edit/:id" element={<ProtectedRoute><MainLayout><AddEditTrafficSign /></MainLayout></ProtectedRoute>} />
            
            {/* Ehliyet Sınıfları rotaları */}
            <Route path="/license-classes" element={<ProtectedRoute><MainLayout><LicenseClassList /></MainLayout></ProtectedRoute>} />
            <Route path="/license-classes/add" element={<ProtectedRoute><MainLayout><AddEditLicenseClass /></MainLayout></ProtectedRoute>} />
            <Route path="/license-classes/edit/:id" element={<ProtectedRoute><MainLayout><AddEditLicenseClass /></MainLayout></ProtectedRoute>} />
            
            {/* Sürücü Kursları rotaları */}
            <Route path="/company" element={<ProtectedRoute><MainLayout><CompanyList /></MainLayout></ProtectedRoute>} />
            <Route path="/company/dashboard" element={<ProtectedRoute><MainLayout><CompanyDashboard /></MainLayout></ProtectedRoute>} />
            <Route path="/company/info" element={<ProtectedRoute><MainLayout><CompanyInfoPage /></MainLayout></ProtectedRoute>} />
            <Route path="/company/add" element={<ProtectedRoute><MainLayout><AddCompany /></MainLayout></ProtectedRoute>} />
            <Route path="/company/edit/:id" element={<ProtectedRoute><MainLayout><AddEditCompany /></MainLayout></ProtectedRoute>} />
            <Route path="/company/:id" element={<ProtectedRoute><MainLayout><CompanyDetail /></MainLayout></ProtectedRoute>}/>
            
            {/* Kursiyer rotaları */}
            <Route path="/students" element={<ProtectedRoute><MainLayout><StudentList /></MainLayout></ProtectedRoute>}/>
            <Route path="/students/add" element={<ProtectedRoute><MainLayout><AddEditStudent /></MainLayout></ProtectedRoute>}/>
            <Route path="/students/edit/:id" element={<ProtectedRoute><MainLayout><AddEditStudent /></MainLayout></ProtectedRoute>}/>
            <Route path="/students/:id" element={<ProtectedRoute><MainLayout><StudentDetail /></MainLayout></ProtectedRoute>}/>
            
            {/* Eğitmen rotaları - Düzeltilmiş */}
            <Route path="/instructors" element={<ProtectedRoute><MainLayout><InstructorList /></MainLayout></ProtectedRoute>}/>
            <Route path="/instructors/:id" element={<ProtectedRoute><MainLayout><InstructorDetail /></MainLayout></ProtectedRoute>}/>
            
            {/* Araç rotaları */}
            <Route path="/vehicles" element={<ProtectedRoute><MainLayout><VehicleList /></MainLayout></ProtectedRoute>}/>
            <Route path="/vehicles/add" element={<ProtectedRoute><MainLayout><AddEditVehicle /></MainLayout></ProtectedRoute>}/>
            <Route path="/vehicles/:id" element={<ProtectedRoute><MainLayout><VehicleDetail /></MainLayout></ProtectedRoute>}/>
            <Route path="/vehicles/edit/:id" element={<ProtectedRoute><MainLayout><AddEditVehicle /></MainLayout></ProtectedRoute>}/>
            
            {/* Bildirim rotaları */}
            <Route path="/notifications" element={<ProtectedRoute><MainLayout><NotificationsList /></MainLayout></ProtectedRoute>}/>
            
            {/* Ödeme rotaları */}
            <Route path="/overdue-payments" element={<ProtectedRoute><MainLayout><OverduePaymentsList /></MainLayout></ProtectedRoute>}/>
            
            {/* Gider rotaları */}
            <Route path="/expense-categories" element={<ProtectedRoute><MainLayout><ExpenseCategoriesPage /></MainLayout></ProtectedRoute>}/>
            <Route path="/expenses" element={<ProtectedRoute><MainLayout><ExpensesPage /></MainLayout></ProtectedRoute>}/>
            
            {/* Direksiyon Eğitimleri */}
            <Route path="/driving-lessons" element={<ProtectedRoute><MainLayout><DrivingLessonsPage /></MainLayout></ProtectedRoute>}/>
            
            {/* Eğitmen Paneli */}
            <Route path="/instructor/dashboard" element={<ProtectedRoute><MainLayout><InstructorDashboardPage /></MainLayout></ProtectedRoute>}/>
            
            {/* Eşleştirme rotaları */}
            <Route path="/matching/saved" element={<ProtectedRoute><MainLayout><SavedMatchingsList /></MainLayout></ProtectedRoute>}/>
            <Route path="/matching/saved/:id" element={<ProtectedRoute><MainLayout><SavedMatchingDetail /></MainLayout></ProtectedRoute>}/>
            <Route path="/matching" element={<ProtectedRoute><MainLayout><StudentInstructorMatching /></MainLayout></ProtectedRoute>}/>
            
            {/* Raporlar */}
            <Route path="/reports" element={<ProtectedRoute><MainLayout><Reports /></MainLayout></ProtectedRoute>}/>
            
            {/* Ayarlar sayfası */}
            <Route path="/settings" element={<ProtectedRoute><MainLayout><SettingsPage /></MainLayout></ProtectedRoute>}/>
            
            {/* Profil sayfaları */}
            <Route path="/settings/company" element={<ProtectedRoute><MainLayout><CompanyAdminProfilePage /></MainLayout></ProtectedRoute>}/>
            <Route path="/profile/instructor" element={<ProtectedRoute><MainLayout><InstructorProfilePage /></MainLayout></ProtectedRoute>}/>
            <Route path="/profile/admin" element={<ProtectedRoute><MainLayout><AdminProfilePage /></MainLayout></ProtectedRoute>}/>
            
            {/* 404 sayfası */}
            <Route path="/404" element={<NotFoundPage />} />
            
            {/* Tüm bilinmeyen rotaları 404 sayfasına yönlendir */}
                        <Route path="*" element={<ProtectedRoute><NotFoundPage /></ProtectedRoute>} />
          </Routes>
        </Router>
      </NavbarProvider>
      </SnackbarProvider>
    </PermissionsProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;