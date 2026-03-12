-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE public.app_role AS ENUM ('citizen', 'provider', 'admin');
CREATE TYPE public.provider_type AS ENUM ('doctor', 'clinic', 'hospital', 'pharmacy', 'laboratory');
CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE public.availability_status AS ENUM ('available', 'busy', 'offline');

-- User roles table (CRITICAL: Separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Profiles table (additional user info)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    language TEXT DEFAULT 'fr',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Specialties table
CREATE TABLE public.specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_fr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Providers table
CREATE TABLE public.providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    provider_type provider_type NOT NULL,
    specialty_id UUID REFERENCES public.specialties(id),
    business_name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT DEFAULT 'Sidi Bel Abbès',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone TEXT NOT NULL,
    email TEXT,
    website TEXT,
    verification_status verification_status DEFAULT 'pending',
    is_emergency BOOLEAN DEFAULT false,
    avatar_url TEXT,
    cover_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Services table
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
    name_fr TEXT NOT NULL,
    name_en TEXT,
    name_ar TEXT,
    description TEXT,
    price DECIMAL(10, 2),
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Schedules table
CREATE TABLE public.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(provider_id, day_of_week, start_time)
);

-- Verifications table
CREATE TABLE public.verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT NOT NULL,
    document_url TEXT NOT NULL,
    status verification_status DEFAULT 'pending',
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ratings table
CREATE TABLE public.ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(provider_id, user_id)
);

-- Analytics events table
CREATE TABLE public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    event_data JSONB,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    page_url TEXT,
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Chat sessions table
CREATE TABLE public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    language TEXT DEFAULT 'fr',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Chat messages table
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Emergency services table
CREATE TABLE public.emergency_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
    is_24_7 BOOLEAN DEFAULT true,
    emergency_phone TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_providers_specialty ON public.providers(specialty_id);
CREATE INDEX idx_providers_verification ON public.providers(verification_status);
CREATE INDEX idx_providers_location ON public.providers(latitude, longitude);
CREATE INDEX idx_ratings_provider ON public.ratings(provider_id);
CREATE INDEX idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_chat_messages_session ON public.chat_messages(session_id);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_services ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- RLS Policies for providers
CREATE POLICY "Verified providers are viewable by everyone"
ON public.providers FOR SELECT
USING (verification_status = 'verified' OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Providers can update their own profile"
ON public.providers FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Providers can insert their own profile"
ON public.providers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all providers"
ON public.providers FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for specialties
CREATE POLICY "Specialties are viewable by everyone"
ON public.specialties FOR SELECT
USING (true);

CREATE POLICY "Admins can manage specialties"
ON public.specialties FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for services
CREATE POLICY "Services are viewable by everyone"
ON public.services FOR SELECT
USING (true);

CREATE POLICY "Providers can manage their own services"
ON public.services FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.providers
    WHERE providers.id = services.provider_id
    AND providers.user_id = auth.uid()
  )
);

-- RLS Policies for schedules
CREATE POLICY "Schedules are viewable by everyone"
ON public.schedules FOR SELECT
USING (true);

CREATE POLICY "Providers can manage their own schedules"
ON public.schedules FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.providers
    WHERE providers.id = schedules.provider_id
    AND providers.user_id = auth.uid()
  )
);

-- RLS Policies for verifications
CREATE POLICY "Providers can view their own verifications"
ON public.verifications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.providers
    WHERE providers.id = verifications.provider_id
    AND providers.user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Providers can insert their own verifications"
ON public.verifications FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.providers
    WHERE providers.id = verifications.provider_id
    AND providers.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all verifications"
ON public.verifications FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for ratings
CREATE POLICY "Ratings are viewable by everyone"
ON public.ratings FOR SELECT
USING (true);

CREATE POLICY "Users can create ratings"
ON public.ratings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
ON public.ratings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
ON public.ratings FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for analytics_events
CREATE POLICY "Users can insert analytics events"
ON public.analytics_events FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all analytics"
ON public.analytics_events FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions"
ON public.chat_sessions FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create chat sessions"
ON public.chat_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages from their sessions"
ON public.chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_sessions
    WHERE chat_sessions.id = chat_messages.session_id
    AND (chat_sessions.user_id = auth.uid() OR chat_sessions.user_id IS NULL)
  )
);

CREATE POLICY "Users can insert messages to their sessions"
ON public.chat_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_sessions
    WHERE chat_sessions.id = chat_messages.session_id
    AND (chat_sessions.user_id = auth.uid() OR chat_sessions.user_id IS NULL)
  )
);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for emergency_services
CREATE POLICY "Emergency services are viewable by everyone"
ON public.emergency_services FOR SELECT
USING (true);

CREATE POLICY "Providers can manage their own emergency services"
ON public.emergency_services FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.providers
    WHERE providers.id = emergency_services.provider_id
    AND providers.user_id = auth.uid()
  )
);

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_providers_updated_at
    BEFORE UPDATE ON public.providers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Default role is citizen
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'citizen');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('verifications', 'verifications', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('provider-images', 'provider-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for verifications
CREATE POLICY "Providers can upload verification documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verifications' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Providers can view their own verification documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verifications' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin'))
);

-- Storage policies for provider images
CREATE POLICY "Provider images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'provider-images');

CREATE POLICY "Providers can upload their own images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'provider-images');

-- Insert some default specialties
INSERT INTO public.specialties (name_fr, name_en, name_ar, icon) VALUES
('Médecin Généraliste', 'General Practitioner', 'طبيب عام', 'Stethoscope'),
('Dentiste', 'Dentist', 'طبيب أسنان', 'Tooth'),
('Cardiologue', 'Cardiologist', 'طبيب قلب', 'Heart'),
('Pédiatre', 'Pediatrician', 'طبيب أطفال', 'Baby'),
('Dermatologue', 'Dermatologist', 'طبيب جلدية', 'Sparkles'),
('Ophtalmologue', 'Ophthalmologist', 'طبيب عيون', 'Eye'),
('Pharmacie', 'Pharmacy', 'صيدلية', 'Pill'),
('Laboratoire', 'Laboratory', 'مختبر', 'FlaskConical'),
('Urgences', 'Emergency', 'طوارئ', 'AlertCircle'),
('Radiologie', 'Radiology', 'أشعة', 'Scan');