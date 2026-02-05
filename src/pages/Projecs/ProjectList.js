import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOffline } from '../../contexts/OfflineContext';
import { 
  Plus, 
  Search, 
  Filter, 
  FolderOpen, 
  MapPin, 
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

const ProjectList = () => {
  const { getData, deleteData, isOnline } = useOffline();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  useEffect(() => {
    loadProjects();
  }, [getData]);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, statusFilter]);

  const loadProjects = async () => {
    try {
      const projectsData = await getData('projects') || [];
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.customer?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  };

  const handleDeleteProject = async (project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      await deleteData('projects', projectToDelete.id);
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      setShowDeleteModal(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Projekt konnte nicht gelöscht werden');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projekte</h1>
          <p className="text-gray-600">Verwalten Sie alle Ihre Baustellenprojekte</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/projects/new" className="btn btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Neues Projekt
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Projekte suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
              >
                <option value="all">Alle Status</option>
                <option value="active">Aktiv</option>
                <option value="pending">Geplant</option>
                <option value="completed">Abgeschlossen</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="card hover:shadow-lg transition-shadow">
              <div className="card-header">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {project.name}
                    </h3>
                    <span className={`status-badge ${getStatusColor(project.status)} mt-1`}>
                      {getStatusText(project.status)}
                    </span>
                  </div>
                  <div className="relative">
                    <button
                      className="p-1 text-gray-400 hover:text-gray-600"
                      onClick={() => {/* Show dropdown */}}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="card-body space-y-3">
                {/* Address */}
                {project.address && (
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                    <span className="text-sm text-gray-600">{project.address}</span>
                  </div>
                )}

                {/* Customer */}
                {project.customer && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Kunde:</span>
                    <span className="ml-2 text-gray-600">{project.customer}</span>
                  </div>
                )}

                {/* Date Range */}
                {(project.startDate || project.endDate) && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {project.startDate && new Date(project.startDate).toLocaleDateString('de-DE')}
                      {project.startDate && project.endDate && ' - '}
                      {project.endDate && new Date(project.endDate).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <div className="flex items-center justify-between">
                  <Link
                    to={`/projects/${project.id}`}
                    className="btn btn-outline btn-sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Details
                  </Link>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/projects/${project.id}/edit`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteProject(project)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'Keine Projekte gefunden' : 'Noch keine Projekte'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Versuchen Sie, Ihre Suchkriterien zu ändern' 
                : 'Legen Sie Ihr erstes Projekt an, um zu beginnen'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link to="/projects/new" className="btn btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Erstes Projekt anlegen
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && projectToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowDeleteModal(false)} />
            
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Projekt löschen?
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Sind Sie sicher, dass Sie das Projekt "{projectToDelete.name}" löschen möchten? 
                  Diese Aktion kann nicht rückgängig gemacht werden.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 btn btn-outline"
                >
                  Abbrechen
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 btn btn-danger"
                >
                  Löschen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
