
CREATE POLICY "Anyone can update contact messages"
  ON public.contact_messages
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
