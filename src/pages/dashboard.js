import { useState, useEffect } from 'react';
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const prisma = new PrismaClient();

const ParticlesBackground = dynamic(
  () => {
    return Promise.resolve(() => {
      useEffect(() => {
        const initializeParticles = (attempt = 1, maxAttempts = 5) => {
          if (typeof window !== 'undefined' && window.particlesJS) {
            window.particlesJS('particles-js', {
              particles: {
                number: { 
                  value: 500,
                  density: { enable: true, value_area: 1000 }
                },
                color: { value: ['#e6e6fa', '#b0c4de', '#f0e68c', '#ffffff'] },
                shape: {
                  type: 'circle',
                  stroke: { width: 0, color: '#000000' },
                },
                opacity: {
                  value: 0.9,
                  random: true,
                  anim: {
                    enable: true,
                    speed: 0.5,
                    opacity_min: 0.2,
                    sync: false
                  },
                },
                size: {
                  value: 2,
                  random: true,
                  anim: {
                    enable: true,
                    speed: 1.5,
                    size_min: 0.3,
                    sync: false
                  },
                },
                line_linked: { 
                  enable: false
                },
                move: {
                  enable: true,
                  speed: 0.5,
                  direction: 'none',
                  random: true,
                  straight: false,
                  out_mode: 'out',
                  bounce: false,
                },
              },
              interactivity: {
                detect_on: 'canvas',
                events: {
                  onhover: { enable: false },
                  onclick: { enable: false },
                  resize: true,
                },
              },
              retina_detect: true,
            });
          } else if (attempt <= maxAttempts) {
            setTimeout(() => initializeParticles(attempt + 1, maxAttempts), 500);
          }
        };

        initializeParticles();
      }, []);

      return (
        <div 
          id="particles-js" 
          className="absolute inset-0 z-0 opacity-60"
          style={{
            background: 'radial-gradient(circle at center, #0a0a23 0%, #000000 100%)'
          }}
        />
      );
    });
  },
  { ssr: false }
);

export default function Dashboard({ user, tasks: initialTasks }) {
  const [newTask, setNewTask] = useState('');
  const [tasks, setTasks] = useState(initialTasks);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState({});
  const [isToggling, setIsToggling] = useState({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    password: '',
    avatar: null
  });
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl || null);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user?.id) {
      router.push('/login');
    }
  }, [user, router]);

  const getInitials = (name) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (!confirmLogout) return;
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST'
      });
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      setIsLoggingOut(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
    setProfileData({
      name: user.name,
      email: user.email,
      password: '',
      avatar: null
    });
    setAvatarPreview(user.avatarUrl || null);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData({ ...profileData, avatar: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('email', profileData.email);
      if (profileData.password) {
        formData.append('password', profileData.password);
      }
      if (profileData.avatar) {
        formData.append('avatar', profileData.avatar);
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      router.replace(router.asPath);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddTask = async () => {
    if (newTask.trim() === '') {
      setError('Task cannot be empty');
      return;
    }
    
    setIsAdding(true);
    setError(null);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTask,
          userId: user.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to add task');

      const addedTask = await response.json();
      setTasks([addedTask, ...tasks]);
      setNewTask('');
    } catch (error) {
      console.error('Error adding task:', error);
      setError(error.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveTask = async (taskId) => {
    setIsDeleting({ ...isDeleting, [taskId]: true });
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      setError(error.message);
    } finally {
      setIsDeleting({ ...isDeleting, [taskId]: false });
    }
  };

  const handleToggleComplete = async (taskId) => {
    setIsToggling({ ...isToggling, [taskId]: true });
    try {
      const taskToUpdate = tasks.find(task => task.id === taskId);
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !taskToUpdate.completed
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
      setError(error.message);
    } finally {
      setIsToggling({ ...isToggling, [taskId]: false });
    }
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = tasks.length - completedTasks;

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Task Manager Dashboard</title>
        <meta name="description" content="Manage your tasks efficiently" />
      </Head>

      <ParticlesBackground />

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-card-bg border-b border-card-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                  {avatarPreview ? (
                    <div className="relative w-full h-full">
                      <Image 
                        src={avatarPreview} 
                        alt={user.name} 
                        fill
                        sizes="40px"
                        className="rounded-full object-cover"
                        priority
                      />
                    </div>
                  ) : (
                    getInitials(user.name)
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Welcome, {user.name}</h1>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleEditProfile}
                  className="btn btn-primary"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="btn bg-error text-white hover:bg-red-600"
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Task Input Section */}
            <div className="lg:col-span-2">
              <div className="card mb-8">
                <h2 className="text-2xl font-semibold mb-4">Add New Task</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleAddTask(); }} className="space-y-4">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      placeholder="Enter your task..."
                      className="input flex-1"
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isAdding}
                    >
                      {isAdding ? 'Adding...' : 'Add Task'}
                    </button>
                  </div>
                  {error && <p className="text-error text-sm">{error}</p>}
                </form>
              </div>

              {/* Task List */}
              <div className="card">
                <h2 className="text-2xl font-semibold mb-4">Your Tasks</h2>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="task-item fade-in"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleComplete(task.id)}
                            className="w-5 h-5 rounded border-card-border text-primary focus:ring-primary"
                            disabled={isToggling[task.id]}
                          />
                          <span className={`text-lg ${task.completed ? 'line-through text-gray-500' : 'text-foreground'}`}>
                            {task.title}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveTask(task.id)}
                          className="text-error hover:text-red-600 transition-colors"
                          disabled={isDeleting[task.id]}
                        >
                          {isDeleting[task.id] ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No tasks yet. Add one above!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="lg:col-span-1">
              <div className="card">
                <h2 className="text-2xl font-semibold mb-4">Task Statistics</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-gray-500">Total Tasks</p>
                    <p className="text-2xl font-semibold">{tasks.length}</p>
                  </div>
                  <div className="p-4 bg-success/10 rounded-lg">
                    <p className="text-sm text-gray-500">Completed Tasks</p>
                    <p className="text-2xl font-semibold">{completedTasks}</p>
                  </div>
                  <div className="p-4 bg-warning/10 rounded-lg">
                    <p className="text-sm text-gray-500">Pending Tasks</p>
                    <p className="text-2xl font-semibold">{pendingTasks}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-md w-full mx-4">
            <h2 className="text-2xl font-semibold mb-4">Edit Profile</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                  type="password"
                  value={profileData.password}
                  onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                  className="input w-full"
                  placeholder="Leave blank to keep current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="input w-full"
                />
              </div>
              {error && <p className="text-error text-sm">{error}</p>}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps(context) {
  const { req } = context;
  const cookies = parse(req.headers.cookie || '');
  const token = cookies.token || null;

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true
      }
    });

    if (!user) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return {
      props: {
        user,
        tasks: JSON.parse(JSON.stringify(tasks))
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}
