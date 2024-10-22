--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0
-- Dumped by pg_dump version 17.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    comment_id integer NOT NULL,
    catch_id integer,
    user_id integer,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: comments_comment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.comments_comment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comments_comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.comments_comment_id_seq OWNED BY public.comments.comment_id;


--
-- Name: fish_catches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fish_catches (
    catch_id integer NOT NULL,
    user_id integer,
    species_id integer,
    location public.geography(Point,4326),
    size numeric(5,2),
    time_caught timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notes text
);


--
-- Name: fish_catches_catch_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fish_catches_catch_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fish_catches_catch_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fish_catches_catch_id_seq OWNED BY public.fish_catches.catch_id;


--
-- Name: species; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.species (
    species_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    image_url character varying(255)
);


--
-- Name: species_species_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.species_species_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: species_species_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.species_species_id_seq OWNED BY public.species.species_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    profile_picture character varying(255),
    join_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: comments comment_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments ALTER COLUMN comment_id SET DEFAULT nextval('public.comments_comment_id_seq'::regclass);


--
-- Name: fish_catches catch_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fish_catches ALTER COLUMN catch_id SET DEFAULT nextval('public.fish_catches_catch_id_seq'::regclass);


--
-- Name: species species_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species ALTER COLUMN species_id SET DEFAULT nextval('public.species_species_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (comment_id);


--
-- Name: fish_catches fish_catches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fish_catches
    ADD CONSTRAINT fish_catches_pkey PRIMARY KEY (catch_id);


--
-- Name: species species_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_pkey PRIMARY KEY (species_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: comments comments_catch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_catch_id_fkey FOREIGN KEY (catch_id) REFERENCES public.fish_catches(catch_id);


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: fish_catches fish_catches_species_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fish_catches
    ADD CONSTRAINT fish_catches_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(species_id);


--
-- Name: fish_catches fish_catches_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fish_catches
    ADD CONSTRAINT fish_catches_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- PostgreSQL database dump complete
--

