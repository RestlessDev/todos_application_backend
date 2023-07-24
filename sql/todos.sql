--
-- PostgreSQL database dump
--

-- Dumped from database version 13.1 (Debian 13.1-1.pgdg100+1)
-- Dumped by pg_dump version 13.4

-- Started on 2023-07-24 23:13:23 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 37198)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 2986 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 203 (class 1259 OID 37233)
-- Name: erstwhile_sessions; Type: TABLE; Schema: public; Owner: todos_user
--

CREATE TABLE public.erstwhile_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_data json NOT NULL,
    expires timestamp without time zone,
    user_id uuid
);


ALTER TABLE public.erstwhile_sessions OWNER TO todos_user;

--
-- TOC entry 201 (class 1259 OID 37176)
-- Name: todos; Type: TABLE; Schema: public; Owner: todos_user
--

CREATE TABLE public.todos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    color text DEFAULT '#0F0'::text NOT NULL,
    user_id uuid NOT NULL,
    create_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mod_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    active_flag boolean DEFAULT true NOT NULL,
    description text NOT NULL,
    date timestamp without time zone NOT NULL,
    done_flag boolean DEFAULT false NOT NULL,
    completion_notes text
);


ALTER TABLE public.todos OWNER TO todos_user;

--
-- TOC entry 202 (class 1259 OID 37212)
-- Name: users; Type: TABLE; Schema: public; Owner: todos_user
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    hashed_password text NOT NULL,
    create_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    active_flag boolean DEFAULT true NOT NULL,
    reset_token text,
    first_name text NOT NULL,
    last_name text NOT NULL,
    username text NOT NULL
);


ALTER TABLE public.users OWNER TO todos_user;

--
-- TOC entry 2999 (class 0 OID 0)
-- Dependencies: 202
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: todos_user
--

COMMENT ON TABLE public.users IS '{
  "hasMany": [
    { "table": "todos", "joinedBy": "userID" }
  ] 

}';


--
-- TOC entry 2846 (class 2606 OID 37241)
-- Name: erstwhile_sessions erstwhile_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: todos_user
--

ALTER TABLE ONLY public.erstwhile_sessions
    ADD CONSTRAINT erstwhile_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 2838 (class 2606 OID 37187)
-- Name: todos todos_pkey; Type: CONSTRAINT; Schema: public; Owner: todos_user
--

ALTER TABLE ONLY public.todos
    ADD CONSTRAINT todos_pkey PRIMARY KEY (id);


--
-- TOC entry 2840 (class 2606 OID 37232)
-- Name: users users_email_uk; Type: CONSTRAINT; Schema: public; Owner: todos_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_uk UNIQUE (email);


--
-- TOC entry 2842 (class 2606 OID 37217)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: todos_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 2844 (class 2606 OID 37230)
-- Name: users users_uname_uk; Type: CONSTRAINT; Schema: public; Owner: todos_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_uname_uk UNIQUE (username);


--
-- TOC entry 2847 (class 2606 OID 37242)
-- Name: erstwhile_sessions session_uid_fk; Type: FK CONSTRAINT; Schema: public; Owner: todos_user
--

ALTER TABLE ONLY public.erstwhile_sessions
    ADD CONSTRAINT session_uid_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 2987 (class 0 OID 0)
-- Dependencies: 205
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: public; Owner: todos_user
--

GRANT ALL ON FUNCTION public.uuid_generate_v1() TO todos_user;


--
-- TOC entry 2988 (class 0 OID 0)
-- Dependencies: 206
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: public; Owner: todos_user
--

GRANT ALL ON FUNCTION public.uuid_generate_v1mc() TO todos_user;


--
-- TOC entry 2989 (class 0 OID 0)
-- Dependencies: 207
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: public; Owner: todos_user
--

GRANT ALL ON FUNCTION public.uuid_generate_v3(namespace uuid, name text) TO todos_user;


--
-- TOC entry 2990 (class 0 OID 0)
-- Dependencies: 204
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: public; Owner: todos_user
--

GRANT ALL ON FUNCTION public.uuid_generate_v4() TO todos_user;


--
-- TOC entry 2991 (class 0 OID 0)
-- Dependencies: 208
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: public; Owner: todos_user
--

GRANT ALL ON FUNCTION public.uuid_generate_v5(namespace uuid, name text) TO todos_user;


--
-- TOC entry 2992 (class 0 OID 0)
-- Dependencies: 209
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: public; Owner: todos_user
--

GRANT ALL ON FUNCTION public.uuid_nil() TO todos_user;


--
-- TOC entry 2993 (class 0 OID 0)
-- Dependencies: 210
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: public; Owner: todos_user
--

GRANT ALL ON FUNCTION public.uuid_ns_dns() TO todos_user;


--
-- TOC entry 2994 (class 0 OID 0)
-- Dependencies: 211
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: public; Owner: todos_user
--

GRANT ALL ON FUNCTION public.uuid_ns_oid() TO todos_user;


--
-- TOC entry 2995 (class 0 OID 0)
-- Dependencies: 212
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: public; Owner: todos_user
--

GRANT ALL ON FUNCTION public.uuid_ns_url() TO todos_user;


--
-- TOC entry 2996 (class 0 OID 0)
-- Dependencies: 213
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: public; Owner: todos_user
--

GRANT ALL ON FUNCTION public.uuid_ns_x500() TO todos_user;


-- Completed on 2023-07-24 23:13:24 UTC

--
-- PostgreSQL database dump complete
--

