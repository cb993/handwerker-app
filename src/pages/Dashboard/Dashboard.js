import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOffline } from '../../contexts/OfflineContext';
import { 
  FolderOpen, 
  Clock, 
  Users, 
  FileText, 
  Plus, 
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  Camera
} from 'lucide-react';

const Dashboard = () => {
  const { isOnline, getData } = useOffline();
  const [stats, setStats] = useState({
    activeProjects: 0,
    completedProjects: 0,
    totalEmployees: 0,
    todayEntries: 0,
    pendingTasks: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load projects
        const projects = await getData('projects') || [];
        const activeProjects = projects.filter(p => p.status === 'active');
        const completedProjects = projects.filter(p => p.status === 'completed');
        
        // Load employees
        const employees = await getData('employees') || [];
        
        // Load today's diary entries
        const today = new Date().toISOString().split('T')[0];
        const diaryEntries = await getData('diaryEntries') || [];
        const todayEntries = diaryEntries.filter(entry => 
          entry.date && entry.date.startsWith(today)
        );

        setStats({
          activeProjects: activeProjects.length,
          completedProjects: completedProjects.length,
          totalEmployees: employees.length,
          todayEntries: todayEntries.length,
          pendingTasks: 0 // Would be calculated from tasks in a real app
        });

        // Get recent projects (last 5)
        const recent = projects
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentProjects(recent);

      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [getData]);

  const statCards = [
    {
      title: 'Aktive Projekte',
      value: stats.activeProjects,
      icon: FolderOpen,
      color: 'blue',
      link: '/projects'
    },
    {
      title: 'Mitarbeiter',
      value: stats.totalEmployees,
      icon: Users,
      color: 'green',
      link: '/employees'
    },
    {
      title: 'Heutige Einträge',
      value: stats.todayEntries,
      icon: Calendar,
      color: 'purple',
      link: '/projects'
    },
    {
      title: 'Abgeschlossen',
      value: stats.completedProjects,
      icon: CheckCircle,
      color: 'gray',
      link: '/projects'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Willkommen zurück! Hier ist Ihre Übersicht.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/projects/new"
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Neues Projekt
          </Link>
        </div>
      </div>

      {/* Online Status */}
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800">
              Sie sind offline. Änderungen werden automatisch synchronisiert, wenn die Verbindung wiederhergestellt ist.
            </span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.link}
              className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Projects and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Neueste Projekte</h3>
          </div>
          <div className="card-body">
            {recentProjects.length > 0 ? (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <p className="text-sm text-gray-500">{project.address}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`status-badge status-${project.status}`}>
                        {project.status === 'active' ? 'Aktiv' : 'Abgeschlossen'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Noch keine Projekte vorhanden</p>
                <Link
                  to="/projects/new"
                  className="btn btn-primary mt-3"
                >
                  Erstes Projekt anlegen
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Schnellaktionen</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/projects/new"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Neues Projekt</span>
              </Link>
              
              <Link
                to="/time-tracking"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Clock className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Zeiterfassung</span>
              </Link>
              
              <Link
                to="/employees"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="w-8 h-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Mitarbeiter</span>
              </Link>
              
              <button
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => {
                  // Quick photo capture - would open camera in real app
                  alert('Kamerafunktion würde hier geöffnet werden');
                }}
              >
                <Camera className="w-8 h-8 text-orange-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Foto machen</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Heutige Aktivitäten</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-900">{stats.todayEntries}</p>
              <p className="text-sm text-blue-700">Bautagebuch-Einträge</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-900">0</p>
              <p className="text-sm text-green-700">Gestempelte Stunden</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-900">0</p>
              <p className="text-sm text-purple-700">Formulare ausgefüllt</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
