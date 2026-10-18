-- SEC-02: elimina policies permisivas huérfanas que anulaban las policies
-- correctas de owner/super-admin ya existentes en projects y project_details,
-- y agrega el DELETE que faltaba en project_details.

DROP POLICY IF EXISTS "Allow all operations on projects" ON public.projects;
DROP POLICY IF EXISTS "Allow all operations on project_details" ON public.project_details;

CREATE POLICY "Users can delete their own project details" ON public.project_details
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_details.project_id
    AND (
      projects.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid() AND user_profiles.is_super_admin = true
      )
    )
  )
);
