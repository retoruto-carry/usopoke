drop policy "Enable insert for authenticated users only" on "public"."card_images";

alter table "public"."card_images" add column "is_public" boolean default false;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_random_card()
 RETURNS SETOF card_images
 LANGUAGE sql
 STABLE
AS $function$select * from public.card_images
where is_public = TRUE
order by random()
limit 1;$function$
;

create policy "Enable insert for anon users only"
on "public"."card_images"
as permissive
for insert
to anon
with check (true);



