
ALTER TABLE provider_reviews
  ADD CONSTRAINT provider_reviews_provider_patient_unique
  UNIQUE (provider_id, patient_id);

CREATE POLICY "Anyone can update provider reports"
  ON provider_reports FOR UPDATE
  USING (true)
  WITH CHECK (true);
