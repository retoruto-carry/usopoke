drop policy "Enable insert for anon users only" on "public"."card_images";

drop policy "Enable read access for all users" on "public"."card_images";

revoke delete on table "public"."card_images" from "anon";

revoke insert on table "public"."card_images" from "anon";

revoke references on table "public"."card_images" from "anon";

revoke select on table "public"."card_images" from "anon";

revoke trigger on table "public"."card_images" from "anon";

revoke truncate on table "public"."card_images" from "anon";

revoke update on table "public"."card_images" from "anon";

revoke delete on table "public"."card_images" from "authenticated";

revoke insert on table "public"."card_images" from "authenticated";

revoke references on table "public"."card_images" from "authenticated";

revoke select on table "public"."card_images" from "authenticated";

revoke trigger on table "public"."card_images" from "authenticated";

revoke truncate on table "public"."card_images" from "authenticated";

revoke update on table "public"."card_images" from "authenticated";

revoke delete on table "public"."card_images" from "service_role";

revoke insert on table "public"."card_images" from "service_role";

revoke references on table "public"."card_images" from "service_role";

revoke select on table "public"."card_images" from "service_role";

revoke trigger on table "public"."card_images" from "service_role";

revoke truncate on table "public"."card_images" from "service_role";

revoke update on table "public"."card_images" from "service_role";

alter table "public"."card_images" drop constraint "card_images_pkey";

drop index if exists "public"."card_images_pkey";

drop table "public"."card_images";

create table "public"."cards" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "image_url" text not null,
    "show_in_gallery" boolean not null,
    "name" text not null,
    "hp" text not null,
    "move1_name" text not null,
    "move1_damage" text not null,
    "move1_info" text not null,
    "move2_name" text not null,
    "move2_damage" text not null,
    "move2_info" text not null
);


alter table "public"."cards" enable row level security;

CREATE UNIQUE INDEX cards2_pkey ON public.cards USING btree (id);

alter table "public"."cards" add constraint "cards2_pkey" PRIMARY KEY using index "cards2_pkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_random_card()
 RETURNS SETOF cards
 LANGUAGE sql
 STABLE
AS $function$
select * from public.cards
order by random()
limit 1;
$function$
;

grant delete on table "public"."cards" to "anon";

grant insert on table "public"."cards" to "anon";

grant references on table "public"."cards" to "anon";

grant select on table "public"."cards" to "anon";

grant trigger on table "public"."cards" to "anon";

grant truncate on table "public"."cards" to "anon";

grant update on table "public"."cards" to "anon";

grant delete on table "public"."cards" to "authenticated";

grant insert on table "public"."cards" to "authenticated";

grant references on table "public"."cards" to "authenticated";

grant select on table "public"."cards" to "authenticated";

grant trigger on table "public"."cards" to "authenticated";

grant truncate on table "public"."cards" to "authenticated";

grant update on table "public"."cards" to "authenticated";

grant delete on table "public"."cards" to "service_role";

grant insert on table "public"."cards" to "service_role";

grant references on table "public"."cards" to "service_role";

grant select on table "public"."cards" to "service_role";

grant trigger on table "public"."cards" to "service_role";

grant truncate on table "public"."cards" to "service_role";

grant update on table "public"."cards" to "service_role";

create policy "Enable insert for anon users only"
on "public"."cards"
as permissive
for insert
to anon
with check (true);


create policy "Enable read access for anon users"
on "public"."cards"
as permissive
for select
to anon
using (true);



