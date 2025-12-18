import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import StudentForm from './pages/StudentForm';
import StudentDetail from './pages/StudentDetail';
import BulkImport from './pages/BulkImport';
import AdminStudentManager from './pages/AdminStudentManager';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/add-student" element={<StudentForm />} />
        <Route path="/bulk-import" element={<BulkImport />} />
        <Route path="/admin/students" element={<AdminStudentManager />} />
        <Route path="/student/:id" element={<StudentDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
