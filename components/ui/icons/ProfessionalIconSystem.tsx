import {
  Users, BookOpen, Bus, CreditCard, AlertTriangle,
  GraduationCap, BarChart3, Mail, FileText, Settings,
  TrendingUp, TrendingDown, CheckCircle, XCircle,
  RefreshCw, Target, Star, Building2, Lightbulb,
  Rocket, Phone, MessageCircle, Smartphone, Banknote,
  User, UserCheck, Folder, Book, Save, ArrowRight,
  ArrowUpRight, ArrowDownRight, UserPlus, Users2,
  Calendar, Clock, Activity, Award, BookMarked,
  Briefcase, Calculator, Camera, ChartBar, ChartLine,
  ChartPie, Database, Download, Edit, Eye, Filter,
  Globe, Heart, Home, Info, Layout, List, Lock,
  LogOut, Map, Monitor, Printer, Search, Shield,
  Upload, Wifi, Zap, HelpCircle, X, Pause, Play,
  History, Loader, Plus, Minus, WifiOff, Bell,
  Trash, MoreHorizontal
} from 'lucide-react';

interface IconProps {
  name: keyof typeof PROFESSIONAL_ICON_MAP;
  size?: number;
  className?: string;
}

// Professional Icon Mapping System
// Replaces all emoji usage with enterprise-grade Lucide icons
export const PROFESSIONAL_ICON_MAP = {
  // Student & Education Icons
  'students': Users,
  'student': User,
  'graduation': GraduationCap,
  'courses': BookOpen,
  'book': Book,
  'education': GraduationCap,
  'enrollment': UserPlus,
  'academic': BookMarked,
  'teaching': Award,

  // Family & People Icons
  'family': Users2,
  'families': Users2,
  'people': Users,
  'person': User,
  'teacher': UserCheck,
  'parent': User,

  // Financial Icons
  'money': CreditCard,
  'fees': CreditCard,
  'finance': CreditCard,
  'payment': Banknote,
  'financial': CreditCard,
  'calculator': Calculator,

  // Transportation & Services
  'transport': Bus,
  'services': Building2,
  'facility': Building2,
  'location': Map,

  // Analytics & Reports
  'analytics': BarChart3,
  'report': FileText,
  'chart': BarChart3,
  'chart-bar': ChartBar,
  'chart-line': ChartLine,
  'chart-pie': ChartPie,
  'data': BarChart3,
  'insights': BarChart3,
  'statistics': ChartBar,

  // Communication
  'email': Mail,
  'message': MessageCircle,
  'phone': Phone,
  'mobile': Smartphone,
  'contact': Phone,

  // Status & Alerts
  'warning': AlertTriangle,
  'alert': AlertTriangle,
  'success': CheckCircle,
  'error': XCircle,
  'check': CheckCircle,
  'info': Info,

  // Trends & Performance
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'arrow-up-right': ArrowUpRight,
  'arrow-down-right': ArrowDownRight,
  'arrow-right': ArrowRight,
  'growth': TrendingUp,
  'decline': TrendingDown,
  'neutral': ArrowRight,

  // System & Operations
  'settings': Settings,
  'system': Settings,
  'refresh': RefreshCw,
  'save': Save,
  'folder': Folder,
  'database': Database,
  'monitor': Monitor,
  'activity': Activity,

  // Actions & Navigation
  'edit': Edit,
  'view': Eye,
  'search': Search,
  'filter': Filter,
  'download': Download,
  'upload': Upload,
  'export': Upload,
  'print': Printer,
  'logout': LogOut,
  'help': HelpCircle,
  'file': FileText,
  'close': X,

  // Time & Calendar
  'calendar': Calendar,
  'clock': Clock,
  'schedule': Calendar,

  // Goals & Achievements
  'target': Target,
  'goal': Target,
  'star': Star,
  'achievement': Star,
  'rocket': Rocket,
  'innovation': Lightbulb,
  'idea': Lightbulb,
  'award': Award,

  // User Management
  'user-check': UserCheck,
  'user': User,
  'users': Users,
  'user-plus': UserPlus,

  // Security & Access
  'lock': Lock,
  'shield': Shield,
  'security': Shield,

  // Layout & Design
  'layout': Layout,
  'list': List,
  'grid': Layout,
  'home': Home,

  // Technology & Network
  'wifi': Wifi,
  'network': Wifi,
  'globe': Globe,
  'zap': Zap,
  'power': Zap,

  // Media & Content
  'camera': Camera,
  'image': Camera,
  'heart': Heart,
  'favorite': Heart,

  // Business & Work
  'briefcase': Briefcase,
  'work': Briefcase,
  'business': Building2,

  // Media Controls
  'pause': Pause,
  'play': Play,
  'history': History,
  'loading': Loader,

  // Basic Actions
  'plus': Plus,
  'minus': Minus,
  'more': MoreHorizontal,
  'trash': Trash,
  'bell': Bell,

  // Network & Connectivity
  'wifi-off': WifiOff,
} as const;

// Professional Icon Component
export function ProfessionalIcon({ name, size = 20, className = '' }: IconProps) {
  const IconComponent = PROFESSIONAL_ICON_MAP[name];
  
  if (!IconComponent) {
    console.warn(`Professional icon "${name}" not found. Using default icon.`);
    return <Settings size={size} className={className} />;
  }
  
  return <IconComponent size={size} className={className} />;
}

// Emoji to Professional Icon Mapping
export const EMOJI_TO_PROFESSIONAL_MAP = {
  // Education & Students
  '👨‍🎓': 'students',
  '🎓': 'graduation',
  '📚': 'courses',
  '📖': 'book',
  '📝': 'report',
  '📋': 'list',

  // People & Family
  '👤': 'user',
  '👥': 'users',
  '👨‍👩‍👧‍👦': 'family',
  '👨‍🏫': 'teacher',
  '👩‍🏫': 'teacher',

  // Transportation & Services
  '🚌': 'transport',
  '🏢': 'business',
  '🏫': 'education',

  // Financial
  '💰': 'fees',
  '💳': 'payment',
  '💵': 'money',
  '🏦': 'financial',

  // Status & Alerts
  '⚠️': 'warning',
  '✅': 'success',
  '❌': 'error',
  '🔴': 'error',
  '🟢': 'success',
  '🟡': 'warning',

  // Trends & Analytics
  '📊': 'analytics',
  '📈': 'trending-up',
  '📉': 'trending-down',
  '↗️': 'arrow-up-right',
  '↘️': 'arrow-down-right',
  '➡️': 'arrow-right',

  // Communication
  '📧': 'email',
  '📞': 'phone',
  '📱': 'mobile',
  '💬': 'message',
  '📢': 'alert',

  // System & Tools
  '🔧': 'settings',
  '⚙️': 'settings',
  '🔄': 'refresh',
  '💾': 'save',
  '📁': 'folder',
  '🖥️': 'monitor',
  '💻': 'monitor',

  // Goals & Achievements
  '🚀': 'rocket',
  '💡': 'innovation',
  '🎯': 'target',
  '⭐': 'star',
  '🏆': 'award',
  '🎖️': 'achievement',

  // Time & Calendar
  '📅': 'calendar',
  '⏰': 'clock',
  '🕐': 'clock',

  // Actions
  '🔍': 'search',
  '📤': 'upload',
  '📥': 'download',
  '🖨️': 'print',
  '👁️': 'view',
  '✏️': 'edit',

  // Security
  '🔒': 'lock',
  '🛡️': 'shield',
  '🔐': 'security',

  // Network & Technology
  '📡': 'wifi',
  '🌐': 'globe',
  '⚡': 'zap',
  '🔌': 'power',

  // Media
  '📷': 'camera',
  '🖼️': 'image',
  '❤️': 'heart',
  '💖': 'favorite',
} as const;

export default ProfessionalIcon;
