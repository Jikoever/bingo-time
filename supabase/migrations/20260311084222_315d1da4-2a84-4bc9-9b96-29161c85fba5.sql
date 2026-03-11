-- Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Users can view their own games" ON public.bingo_games;
DROP POLICY IF EXISTS "Users can create their own games" ON public.bingo_games;
DROP POLICY IF EXISTS "Users can update their own games" ON public.bingo_games;
DROP POLICY IF EXISTS "Users can delete their own games" ON public.bingo_games;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Recreate as PERMISSIVE for bingo_games
CREATE POLICY "Users can view their own games" ON public.bingo_games FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own games" ON public.bingo_games FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own games" ON public.bingo_games FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own games" ON public.bingo_games FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Recreate as PERMISSIVE for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);