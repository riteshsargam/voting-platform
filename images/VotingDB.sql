-- Database generated with pgModeler (PostgreSQL Database Modeler).
-- pgModeler version: 0.9.4
-- PostgreSQL version: 13.0
-- Project Site: pgmodeler.io
-- Model Author: ---

-- Database creation must be performed outside a multi lined SQL file. 
-- These commands were put in this file only as a convenience.
-- 
-- object: "wd-voting-dev" | type: DATABASE --
-- DROP DATABASE IF EXISTS "wd-voting-dev";
CREATE DATABASE "wd-voting-dev"
	ENCODING = 'UTF8'
	LC_COLLATE = 'English_India.1252'
	LC_CTYPE = 'English_India.1252'
	TABLESPACE = pg_default
	OWNER = postgres;
-- ddl-end --


-- object: public."SequelizeMeta" | type: TABLE --
-- DROP TABLE IF EXISTS public."SequelizeMeta" CASCADE;
CREATE TABLE public."SequelizeMeta" (
	name character varying(255) NOT NULL,
	CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name)
);
-- ddl-end --
ALTER TABLE public."SequelizeMeta" OWNER TO postgres;
-- ddl-end --

-- object: public."ElectionAdmins_id_seq" | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public."ElectionAdmins_id_seq" CASCADE;
CREATE SEQUENCE public."ElectionAdmins_id_seq"
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;

-- ddl-end --
ALTER SEQUENCE public."ElectionAdmins_id_seq" OWNER TO postgres;
-- ddl-end --

-- object: public."ElectionAdmins" | type: TABLE --
-- DROP TABLE IF EXISTS public."ElectionAdmins" CASCADE;
CREATE TABLE public."ElectionAdmins" (
	id integer NOT NULL DEFAULT nextval('public."ElectionAdmins_id_seq"'::regclass),
	firstname character varying(255),
	lastname character varying(255),
	email character varying(255),
	password character varying(255),
	username character varying(255),
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	CONSTRAINT "ElectionAdmins_pkey" PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public."ElectionAdmins" OWNER TO postgres;
-- ddl-end --

-- object: public."Voters_id_seq" | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public."Voters_id_seq" CASCADE;
CREATE SEQUENCE public."Voters_id_seq"
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;

-- ddl-end --
ALTER SEQUENCE public."Voters_id_seq" OWNER TO postgres;
-- ddl-end --

-- object: public."Voters" | type: TABLE --
-- DROP TABLE IF EXISTS public."Voters" CASCADE;
CREATE TABLE public."Voters" (
	id integer NOT NULL DEFAULT nextval('public."Voters_id_seq"'::regclass),
	voterid character varying(255),
	password character varying(255),
	votername character varying(255),
	firstname character varying(255),
	lastname character varying(255),
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	"EId" integer,
	CONSTRAINT "Voters_pkey" PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public."Voters" OWNER TO postgres;
-- ddl-end --

-- object: public."Elections_id_seq" | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public."Elections_id_seq" CASCADE;
CREATE SEQUENCE public."Elections_id_seq"
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;

-- ddl-end --
ALTER SEQUENCE public."Elections_id_seq" OWNER TO postgres;
-- ddl-end --

-- object: public."Elections" | type: TABLE --
-- DROP TABLE IF EXISTS public."Elections" CASCADE;
CREATE TABLE public."Elections" (
	id integer NOT NULL DEFAULT nextval('public."Elections_id_seq"'::regclass),
	"electionName" character varying(255),
	"customString" character varying(255),
	"isLive" boolean DEFAULT false,
	ended boolean DEFAULT false,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	"UId" integer,
	CONSTRAINT "Elections_pkey" PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public."Elections" OWNER TO postgres;
-- ddl-end --

-- object: public."Questions_id_seq" | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public."Questions_id_seq" CASCADE;
CREATE SEQUENCE public."Questions_id_seq"
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;

-- ddl-end --
ALTER SEQUENCE public."Questions_id_seq" OWNER TO postgres;
-- ddl-end --

-- object: public."Questions" | type: TABLE --
-- DROP TABLE IF EXISTS public."Questions" CASCADE;
CREATE TABLE public."Questions" (
	id integer NOT NULL DEFAULT nextval('public."Questions_id_seq"'::regclass),
	title character varying(255),
	"desc" text,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	"EId" integer,
	CONSTRAINT "Questions_pkey" PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public."Questions" OWNER TO postgres;
-- ddl-end --

-- object: public."Options_id_seq" | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public."Options_id_seq" CASCADE;
CREATE SEQUENCE public."Options_id_seq"
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;

-- ddl-end --
ALTER SEQUENCE public."Options_id_seq" OWNER TO postgres;
-- ddl-end --

-- object: public."Options" | type: TABLE --
-- DROP TABLE IF EXISTS public."Options" CASCADE;
CREATE TABLE public."Options" (
	id integer NOT NULL DEFAULT nextval('public."Options_id_seq"'::regclass),
	"desc" character varying(255),
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	"QId" integer,
	CONSTRAINT "Options_pkey" PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public."Options" OWNER TO postgres;
-- ddl-end --

-- object: public."Votes_id_seq" | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public."Votes_id_seq" CASCADE;
CREATE SEQUENCE public."Votes_id_seq"
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;

-- ddl-end --
ALTER SEQUENCE public."Votes_id_seq" OWNER TO postgres;
-- ddl-end --

-- object: public."Votes" | type: TABLE --
-- DROP TABLE IF EXISTS public."Votes" CASCADE;
CREATE TABLE public."Votes" (
	id integer NOT NULL DEFAULT nextval('public."Votes_id_seq"'::regclass),
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	"QId" integer,
	"OId" integer,
	"VId" integer,
	CONSTRAINT "Votes_pkey" PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public."Votes" OWNER TO postgres;
-- ddl-end --

-- object: "custom_fkey_electionId" | type: CONSTRAINT --
-- ALTER TABLE public."Voters" DROP CONSTRAINT IF EXISTS "custom_fkey_electionId" CASCADE;
ALTER TABLE public."Voters" ADD CONSTRAINT "custom_fkey_electionId" FOREIGN KEY ("EId")
REFERENCES public."Elections" (id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE NO ACTION;
-- ddl-end --

-- object: "custom_fkey_userId" | type: CONSTRAINT --
-- ALTER TABLE public."Elections" DROP CONSTRAINT IF EXISTS "custom_fkey_userId" CASCADE;
ALTER TABLE public."Elections" ADD CONSTRAINT "custom_fkey_userId" FOREIGN KEY ("UId")
REFERENCES public."ElectionAdmins" (id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE NO ACTION;
-- ddl-end --

-- object: "custom_fkey_electionId" | type: CONSTRAINT --
-- ALTER TABLE public."Questions" DROP CONSTRAINT IF EXISTS "custom_fkey_electionId" CASCADE;
ALTER TABLE public."Questions" ADD CONSTRAINT "custom_fkey_electionId" FOREIGN KEY ("EId")
REFERENCES public."Elections" (id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE NO ACTION;
-- ddl-end --

-- object: "custom_fkey_questionId" | type: CONSTRAINT --
-- ALTER TABLE public."Options" DROP CONSTRAINT IF EXISTS "custom_fkey_questionId" CASCADE;
ALTER TABLE public."Options" ADD CONSTRAINT "custom_fkey_questionId" FOREIGN KEY ("QId")
REFERENCES public."Questions" (id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE NO ACTION;
-- ddl-end --

-- object: "custom_fkey_questionId" | type: CONSTRAINT --
-- ALTER TABLE public."Votes" DROP CONSTRAINT IF EXISTS "custom_fkey_questionId" CASCADE;
ALTER TABLE public."Votes" ADD CONSTRAINT "custom_fkey_questionId" FOREIGN KEY ("QId")
REFERENCES public."Questions" (id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE NO ACTION;
-- ddl-end --

-- object: "custom_fkey_optionId" | type: CONSTRAINT --
-- ALTER TABLE public."Votes" DROP CONSTRAINT IF EXISTS "custom_fkey_optionId" CASCADE;
ALTER TABLE public."Votes" ADD CONSTRAINT "custom_fkey_optionId" FOREIGN KEY ("OId")
REFERENCES public."Options" (id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE NO ACTION;
-- ddl-end --

-- object: "custom_fkey_voterId" | type: CONSTRAINT --
-- ALTER TABLE public."Votes" DROP CONSTRAINT IF EXISTS "custom_fkey_voterId" CASCADE;
ALTER TABLE public."Votes" ADD CONSTRAINT "custom_fkey_voterId" FOREIGN KEY ("VId")
REFERENCES public."Voters" (id) MATCH SIMPLE
ON DELETE CASCADE ON UPDATE NO ACTION;
-- ddl-end --

-- object: "grant_CU_eb94f049ac" | type: PERMISSION --
GRANT CREATE,USAGE
   ON SCHEMA public
   TO postgres;
-- ddl-end --

-- object: "grant_CU_cd8e46e7b6" | type: PERMISSION --
GRANT CREATE,USAGE
   ON SCHEMA public
   TO PUBLIC;
-- ddl-end --


