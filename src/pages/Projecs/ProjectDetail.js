import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOffline } from '../../contexts/OfflineContext';
import { 
  ArrowLeft, 
  Edit, 
  MapPin, 
  Calendar, 
  User, 
  Building,
  MessageSquare,
  Camera,
  FileText,
  Clock,
  Plus,
  MoreVertical
} from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getData, isOnline } = useOffline();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadProject();
  }, [id, getData]);

  const loadProject = async () => {
    try {
      const projectData = await getData('projects', id);
      if (projectData) {
        setProject(projectData);
      } else {
        // Project not found
        navigate('/projects');
      }
    } catch (error) {
      console.error('Failed to load project:', error);
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-pending';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Aktiv';
      case 'completed':
        return 'Abgeschlossen';
      case 'pending':
        return 'Geplant';
      default:
        return 'Unbekannt';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Projekt nicht gefunden</h3>
        <Link to="/projects" className="btn btn-primary">
          Zurück zur Projektliste
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Übersicht', icon: Building },
    { id: 'diary', name: 'Bautagebuch', icon: FileText },
    { id: 'chat', name: 'Kommunikation', icon: MessageSquare },
    { id: 'photos', name: 'Fotos', icon: Camera },
    { id: 'time', name: 'Zeiterfassung', icon: Clock },
    { id: 'forms', name: 'Formulare', icon: FileText }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/projects')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">{project.address}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`status-badge ${getStatusColor(project.status)}`}>
            {getStatusText(project.status)}
          </span>
          <Link
            to={`/projects/${project.id}/edit`}
            className="btn btn-outline"
          >
            <Edit className="w-4 h-4 mr-2" />
            Bearbeiten
          </Link>
        </div>
      </div>

      {/* Offline Status */}
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="loading-spinner w-4 h-4 text-yellow-600 mr-2"></div>
            <span className="text-yellow-800">
              Sie sind offline. Änderungen werden später synchronisiert.
            </span>
          </div>
        </div>
      )}

      {/* Project Info Card */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Customer */}
            <div className="flex items-start">
              <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Kunde</p>
                <p className="text-sm text-gray-600">{project.customer || '-'}</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Adresse</p>
                <p className="text-sm text-gray-600">{project.address || '-'}</p>
              </div>
            </div>

            {/* Start Date */}
            <div className="flex items-start">
              <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Startdatum</p>
                <p className="text-sm text-gray-600">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString('de-DE') : '-'}
                </p>
              </div>
            </div>

            {/* End Date */}
            <div className="flex items-start">
              <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Enddatum</p>
                <p className="text-sm text-gray-600">
                  {project.endDate ? new Date(project.endDate).toLocaleDateString('de-DE') : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Beschreibung</h3>
              <p className="text-sm text-gray-600">{project.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center px-1 py-4 border-b-2 text-sm font-medium transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-screen">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">Schnellaktionen</h3>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to={`/projects/${project.id}/diary`}
                      className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="w-8 h-8 text-blue-600 mb-2" />
                      <span className="text-sm font-medium text-gray-900">Bautagebuch</span>
                    </Link>
                    
                    <button
                      className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => alert('Kamerafunktion würde hier geöffnet werden')}
                    >
                      <Camera className="w-8 h-8 text-green-600 mb-2" />
                      <span className="text-sm font-medium text-gray-900">Foto machen</span>
                    </button>
                    
                    <Link
                      to={`/time-tracking?project=${project.id}`}
                      className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Clock className="w-8 h-8 text-purple-600 mb-2" />
                      <span className="text-sm font-medium text-gray-900">Zeiterfassung</span>
                    </Link>
                    
                    <Link
                      to={`/projects/${project.id}/forms`}
                      className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="w-8 h-8 text-orange-600 mb-2" />
                      <span className="text-sm font-medium text-gray-900">Formular</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">Letzte Aktivitäten</h3>
                </div>
                <div className="card-body">
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Noch keine Aktivitäten</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Beginnen Sie mit der Dokumentation Ihrer Baustelle
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'diary' && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Bautagebuch</h3>
            <p className="text-gray-600 mb-4">Dokumentieren Sie den Fortschritt Ihrer Baustelle</p>
            <Link
              to={`/projects/${project.id}/diary`}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Neuen Eintrag erstellen
            </Link>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Kommunikation</h3>
            <p className="text-gray-600 mb-4">Kommunizieren Sie mit Ihrem Team</p>
            <button className="btn btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Nachricht senden
            </button>
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Fotodokumentation</h3>
            <p className="text-gray-600 mb-4">Fotos von der Baustelle hochladen</p>
            <button 
              className="btn btn-primary"
              onClick={() => alert('Fotofunktion würde hier geöffnet werden')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Fotos hochladen
            </button>
          </div>
        )}

        {activeTab === 'time' && (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Zeiterfassung</h3>
            <p className="text-gray-600 mb-4">Erfassen Sie Arbeitszeiten für dieses Projekt</p>
            <Link
              to={`/time-tracking?project=${project.id}`}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Zeit erfassen
            </Link>
          </div>
        )}

        {activeTab === 'forms' && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Digitale Formulare</h3>
            <p className="text-gray-600 mb-4">Erstellen Sie digitale Rapporte und Dokumente</p>
            <Link
              to={`/projects/${project.id}/forms`}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Formular erstellen
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
