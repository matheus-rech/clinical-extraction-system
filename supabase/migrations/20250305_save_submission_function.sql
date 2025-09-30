-- Supabase migration: transactional submission persistence
-- Wraps form submission and coordinate inserts in a single database function

create or replace function public.save_submission_with_coordinates(
  document_name text,
  form_payload jsonb,
  total_pages int,
  metadata jsonb default null,
  coordinates jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
as $$
declare
  new_submission_id uuid;
  coordinate_count int;
begin
  coordinate_count := case
    when coordinates is null then 0
    when jsonb_typeof(coordinates) = 'array' then jsonb_array_length(coordinates)
    else 0
  end;

  insert into public.form_submissions (
    document_name,
    total_pages,
    extraction_count,
    form_payload,
    metadata
  )
  values (
    document_name,
    total_pages,
    coordinate_count,
    form_payload,
    metadata
  )
  returning id into new_submission_id;

  if coordinate_count > 0 then
    insert into public.extraction_coordinates (
      submission_id,
      field_name,
      page,
      text,
      x,
      y,
      width,
      height,
      selection_method,
      document_name
    )
    select
      new_submission_id,
      coord.field_name,
      coord.page,
      coord.text,
      coord.x,
      coord.y,
      coord.width,
      coord.height,
      coord.selection_method,
      coalesce(coord.document_name, document_name)
    from jsonb_to_recordset(coordinates) as coord(
      field_name text,
      page int,
      text text,
      x numeric,
      y numeric,
      width numeric,
      height numeric,
      selection_method text,
      document_name text
    );
  end if;

  return new_submission_id;
exception
  when others then
    -- Propagate errors so Supabase client surfaces them; transaction will roll back automatically.
    raise;
end;
$$;
