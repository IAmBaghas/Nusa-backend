PGDMP  $                
    |         
   sekolahglr    17.0    17.0 �    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            �           1262    16548 
   sekolahglr    DATABASE     �   CREATE DATABASE sekolahglr WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE sekolahglr;
                     postgres    false            �            1255    16549    update_updated_at_column()    FUNCTION     �   CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;
 1   DROP FUNCTION public.update_updated_at_column();
       public               postgres    false            �            1259    16550    agenda    TABLE     g  CREATE TABLE public.agenda (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.agenda;
       public         heap r       postgres    false            �            1259    16557    agenda_id_seq    SEQUENCE     �   CREATE SEQUENCE public.agenda_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.agenda_id_seq;
       public               postgres    false    217            �           0    0    agenda_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.agenda_id_seq OWNED BY public.agenda.id;
          public               postgres    false    218            �            1259    16558    foto    TABLE     �   CREATE TABLE public.foto (
    id integer NOT NULL,
    galery_id integer,
    file character varying(255) NOT NULL,
    judul character varying(255) NOT NULL
);
    DROP TABLE public.foto;
       public         heap r       postgres    false            �            1259    16563    foto_id_seq    SEQUENCE     �   CREATE SEQUENCE public.foto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.foto_id_seq;
       public               postgres    false    219            �           0    0    foto_id_seq    SEQUENCE OWNED BY     ;   ALTER SEQUENCE public.foto_id_seq OWNED BY public.foto.id;
          public               postgres    false    220            �            1259    16564 
   foto_siswa    TABLE     ?  CREATE TABLE public.foto_siswa (
    id integer NOT NULL,
    siswaglr_id integer NOT NULL,
    file character varying(255) NOT NULL,
    judul character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.foto_siswa;
       public         heap r       postgres    false            �            1259    16571    foto_siswa_id_seq    SEQUENCE     �   CREATE SEQUENCE public.foto_siswa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.foto_siswa_id_seq;
       public               postgres    false    221            �           0    0    foto_siswa_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.foto_siswa_id_seq OWNED BY public.foto_siswa.id;
          public               postgres    false    222            �            1259    16572    galery    TABLE     �   CREATE TABLE public.galery (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    post_id integer,
    "position" integer DEFAULT 1,
    status integer DEFAULT 0
);
    DROP TABLE public.galery;
       public         heap r       postgres    false            �            1259    16577    galery_id_seq    SEQUENCE     �   CREATE SEQUENCE public.galery_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.galery_id_seq;
       public               postgres    false    223            �           0    0    galery_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.galery_id_seq OWNED BY public.galery.id;
          public               postgres    false    224            �            1259    16578    kategori    TABLE     d   CREATE TABLE public.kategori (
    id integer NOT NULL,
    judul character varying(32) NOT NULL
);
    DROP TABLE public.kategori;
       public         heap r       postgres    false            �            1259    16581    kategori_id_seq    SEQUENCE     �   CREATE SEQUENCE public.kategori_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.kategori_id_seq;
       public               postgres    false    225            �           0    0    kategori_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.kategori_id_seq OWNED BY public.kategori.id;
          public               postgres    false    226            �            1259    16582    notifications    TABLE     n  CREATE TABLE public.notifications (
    id integer NOT NULL,
    recipient_id integer NOT NULL,
    sender_id integer NOT NULL,
    post_id integer NOT NULL,
    type character varying(50) NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status boolean DEFAULT true
);
 !   DROP TABLE public.notifications;
       public         heap r       postgres    false            �            1259    16590    notifications_id_seq    SEQUENCE     �   CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.notifications_id_seq;
       public               postgres    false    227            �           0    0    notifications_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;
          public               postgres    false    228            �            1259    16591    petugas    TABLE     q  CREATE TABLE public.petugas (
    id integer NOT NULL,
    username character varying(32) NOT NULL,
    password character varying(256) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    email character varying(255),
    otp character varying(6),
    otp_expires_at timestamp without time zone,
    is_verified boolean DEFAULT false
);
    DROP TABLE public.petugas;
       public         heap r       postgres    false            �            1259    16598    petugas_id_seq    SEQUENCE     �   CREATE SEQUENCE public.petugas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.petugas_id_seq;
       public               postgres    false    229            �           0    0    petugas_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.petugas_id_seq OWNED BY public.petugas.id;
          public               postgres    false    230            �            1259    16800    post_comments    TABLE       CREATE TABLE public.post_comments (
    id integer NOT NULL,
    post_id integer,
    ip_address character varying(45) NOT NULL,
    commenter_name character varying(100) NOT NULL,
    comment_text text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 !   DROP TABLE public.post_comments;
       public         heap r       postgres    false            �            1259    16799    post_comments_id_seq    SEQUENCE     �   CREATE SEQUENCE public.post_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.post_comments_id_seq;
       public               postgres    false    248            �           0    0    post_comments_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.post_comments_id_seq OWNED BY public.post_comments.id;
          public               postgres    false    247            �            1259    16785 
   post_likes    TABLE     �   CREATE TABLE public.post_likes (
    id integer NOT NULL,
    post_id integer,
    ip_address character varying(45) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.post_likes;
       public         heap r       postgres    false            �            1259    16784    post_likes_id_seq    SEQUENCE     �   CREATE SEQUENCE public.post_likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.post_likes_id_seq;
       public               postgres    false    246            �           0    0    post_likes_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.post_likes_id_seq OWNED BY public.post_likes.id;
          public               postgres    false    245            �            1259    16599    posts    TABLE     �   CREATE TABLE public.posts (
    id integer NOT NULL,
    judul character varying(128) NOT NULL,
    kategori_id integer,
    isi text,
    petugas_id integer,
    status smallint,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.posts;
       public         heap r       postgres    false            �            1259    16605    posts_id_seq    SEQUENCE     �   CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.posts_id_seq;
       public               postgres    false    231            �           0    0    posts_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;
          public               postgres    false    232            �            1259    16606    profile    TABLE       CREATE TABLE public.profile (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    profile_image character varying(255),
    is_first_login boolean DEFAULT true,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    main_page boolean DEFAULT false,
    status boolean DEFAULT true,
    CONSTRAINT email_format CHECK (((email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)),
    CONSTRAINT username_format CHECK (((username)::text ~* '^[a-zA-Z0-9._-]+$'::text))
);
    DROP TABLE public.profile;
       public         heap r       postgres    false            �            1259    16618    profile_id_seq    SEQUENCE     �   CREATE SEQUENCE public.profile_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.profile_id_seq;
       public               postgres    false    233            �           0    0    profile_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.profile_id_seq OWNED BY public.profile.id;
          public               postgres    false    234            �            1259    16619    siswa_post_comments    TABLE     �   CREATE TABLE public.siswa_post_comments (
    id integer NOT NULL,
    post_id integer,
    profile_id integer,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status boolean DEFAULT true
);
 '   DROP TABLE public.siswa_post_comments;
       public         heap r       postgres    false            �            1259    16626    siswa_post_comments_id_seq    SEQUENCE     �   CREATE SEQUENCE public.siswa_post_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE public.siswa_post_comments_id_seq;
       public               postgres    false    235            �           0    0    siswa_post_comments_id_seq    SEQUENCE OWNED BY     Y   ALTER SEQUENCE public.siswa_post_comments_id_seq OWNED BY public.siswa_post_comments.id;
          public               postgres    false    236            �            1259    16627    siswa_post_likes    TABLE     �   CREATE TABLE public.siswa_post_likes (
    id integer NOT NULL,
    siswapost_id integer NOT NULL,
    profile_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 $   DROP TABLE public.siswa_post_likes;
       public         heap r       postgres    false            �            1259    16631    siswa_post_likes_id_seq    SEQUENCE     �   CREATE SEQUENCE public.siswa_post_likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.siswa_post_likes_id_seq;
       public               postgres    false    237            �           0    0    siswa_post_likes_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.siswa_post_likes_id_seq OWNED BY public.siswa_post_likes.id;
          public               postgres    false    238            �            1259    16632    siswa_posts    TABLE     I  CREATE TABLE public.siswa_posts (
    id integer NOT NULL,
    profile_id integer NOT NULL,
    caption text NOT NULL,
    likes_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status boolean DEFAULT true
);
    DROP TABLE public.siswa_posts;
       public         heap r       postgres    false            �            1259    16641    siswa_posts_id_seq    SEQUENCE     �   CREATE SEQUENCE public.siswa_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.siswa_posts_id_seq;
       public               postgres    false    239            �           0    0    siswa_posts_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.siswa_posts_id_seq OWNED BY public.siswa_posts.id;
          public               postgres    false    240            �            1259    16642    siswaglr    TABLE     �   CREATE TABLE public.siswaglr (
    id integer NOT NULL,
    siswapost_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.siswaglr;
       public         heap r       postgres    false            �            1259    16647    siswaglr_id_seq    SEQUENCE     �   CREATE SEQUENCE public.siswaglr_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.siswaglr_id_seq;
       public               postgres    false    241            �           0    0    siswaglr_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.siswaglr_id_seq OWNED BY public.siswaglr.id;
          public               postgres    false    242            �            1259    16648    web_settings    TABLE     �   CREATE TABLE public.web_settings (
    id integer NOT NULL,
    component character varying(50) NOT NULL,
    settings jsonb NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
     DROP TABLE public.web_settings;
       public         heap r       postgres    false            �            1259    16654    web_settings_id_seq    SEQUENCE     �   CREATE SEQUENCE public.web_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.web_settings_id_seq;
       public               postgres    false    243            �           0    0    web_settings_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.web_settings_id_seq OWNED BY public.web_settings.id;
          public               postgres    false    244            �           2604    16655 	   agenda id    DEFAULT     f   ALTER TABLE ONLY public.agenda ALTER COLUMN id SET DEFAULT nextval('public.agenda_id_seq'::regclass);
 8   ALTER TABLE public.agenda ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    218    217            �           2604    16656    foto id    DEFAULT     b   ALTER TABLE ONLY public.foto ALTER COLUMN id SET DEFAULT nextval('public.foto_id_seq'::regclass);
 6   ALTER TABLE public.foto ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    220    219            �           2604    16657    foto_siswa id    DEFAULT     n   ALTER TABLE ONLY public.foto_siswa ALTER COLUMN id SET DEFAULT nextval('public.foto_siswa_id_seq'::regclass);
 <   ALTER TABLE public.foto_siswa ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    222    221            �           2604    16658 	   galery id    DEFAULT     f   ALTER TABLE ONLY public.galery ALTER COLUMN id SET DEFAULT nextval('public.galery_id_seq'::regclass);
 8   ALTER TABLE public.galery ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    224    223            �           2604    16659    kategori id    DEFAULT     j   ALTER TABLE ONLY public.kategori ALTER COLUMN id SET DEFAULT nextval('public.kategori_id_seq'::regclass);
 :   ALTER TABLE public.kategori ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    226    225            �           2604    16660    notifications id    DEFAULT     t   ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);
 ?   ALTER TABLE public.notifications ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    228    227            �           2604    16661 
   petugas id    DEFAULT     h   ALTER TABLE ONLY public.petugas ALTER COLUMN id SET DEFAULT nextval('public.petugas_id_seq'::regclass);
 9   ALTER TABLE public.petugas ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    230    229            �           2604    16803    post_comments id    DEFAULT     t   ALTER TABLE ONLY public.post_comments ALTER COLUMN id SET DEFAULT nextval('public.post_comments_id_seq'::regclass);
 ?   ALTER TABLE public.post_comments ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    248    247    248            �           2604    16788    post_likes id    DEFAULT     n   ALTER TABLE ONLY public.post_likes ALTER COLUMN id SET DEFAULT nextval('public.post_likes_id_seq'::regclass);
 <   ALTER TABLE public.post_likes ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    245    246    246            �           2604    16662    posts id    DEFAULT     d   ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);
 7   ALTER TABLE public.posts ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    232    231            �           2604    16663 
   profile id    DEFAULT     h   ALTER TABLE ONLY public.profile ALTER COLUMN id SET DEFAULT nextval('public.profile_id_seq'::regclass);
 9   ALTER TABLE public.profile ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    234    233            �           2604    16664    siswa_post_comments id    DEFAULT     �   ALTER TABLE ONLY public.siswa_post_comments ALTER COLUMN id SET DEFAULT nextval('public.siswa_post_comments_id_seq'::regclass);
 E   ALTER TABLE public.siswa_post_comments ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    236    235            �           2604    16665    siswa_post_likes id    DEFAULT     z   ALTER TABLE ONLY public.siswa_post_likes ALTER COLUMN id SET DEFAULT nextval('public.siswa_post_likes_id_seq'::regclass);
 B   ALTER TABLE public.siswa_post_likes ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    238    237            �           2604    16666    siswa_posts id    DEFAULT     p   ALTER TABLE ONLY public.siswa_posts ALTER COLUMN id SET DEFAULT nextval('public.siswa_posts_id_seq'::regclass);
 =   ALTER TABLE public.siswa_posts ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    240    239            �           2604    16667    siswaglr id    DEFAULT     j   ALTER TABLE ONLY public.siswaglr ALTER COLUMN id SET DEFAULT nextval('public.siswaglr_id_seq'::regclass);
 :   ALTER TABLE public.siswaglr ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    242    241            �           2604    16668    web_settings id    DEFAULT     r   ALTER TABLE ONLY public.web_settings ALTER COLUMN id SET DEFAULT nextval('public.web_settings_id_seq'::regclass);
 >   ALTER TABLE public.web_settings ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    244    243            �          0    16550    agenda 
   TABLE DATA           f   COPY public.agenda (id, title, start_date, end_date, description, created_at, updated_at) FROM stdin;
    public               postgres    false    217   %�       �          0    16558    foto 
   TABLE DATA           :   COPY public.foto (id, galery_id, file, judul) FROM stdin;
    public               postgres    false    219   B�       �          0    16564 
   foto_siswa 
   TABLE DATA           Z   COPY public.foto_siswa (id, siswaglr_id, file, judul, created_at, updated_at) FROM stdin;
    public               postgres    false    221   _�       �          0    16572    galery 
   TABLE DATA           G   COPY public.galery (id, name, post_id, "position", status) FROM stdin;
    public               postgres    false    223   |�       �          0    16578    kategori 
   TABLE DATA           -   COPY public.kategori (id, judul) FROM stdin;
    public               postgres    false    225   ��       �          0    16582    notifications 
   TABLE DATA           y   COPY public.notifications (id, recipient_id, sender_id, post_id, type, content, is_read, created_at, status) FROM stdin;
    public               postgres    false    227   ��       �          0    16591    petugas 
   TABLE DATA           n   COPY public.petugas (id, username, password, created_at, email, otp, otp_expires_at, is_verified) FROM stdin;
    public               postgres    false    229   Ӵ       �          0    16800    post_comments 
   TABLE DATA           j   COPY public.post_comments (id, post_id, ip_address, commenter_name, comment_text, created_at) FROM stdin;
    public               postgres    false    248   �       �          0    16785 
   post_likes 
   TABLE DATA           I   COPY public.post_likes (id, post_id, ip_address, created_at) FROM stdin;
    public               postgres    false    246   �       �          0    16599    posts 
   TABLE DATA           \   COPY public.posts (id, judul, kategori_id, isi, petugas_id, status, created_at) FROM stdin;
    public               postgres    false    231   *�       �          0    16606    profile 
   TABLE DATA           �   COPY public.profile (id, username, password, full_name, email, profile_image, is_first_login, last_login, created_at, updated_at, main_page, status) FROM stdin;
    public               postgres    false    233   G�       �          0    16619    siswa_post_comments 
   TABLE DATA           c   COPY public.siswa_post_comments (id, post_id, profile_id, content, created_at, status) FROM stdin;
    public               postgres    false    235   d�       �          0    16627    siswa_post_likes 
   TABLE DATA           T   COPY public.siswa_post_likes (id, siswapost_id, profile_id, created_at) FROM stdin;
    public               postgres    false    237   ��       �          0    16632    siswa_posts 
   TABLE DATA           k   COPY public.siswa_posts (id, profile_id, caption, likes_count, created_at, updated_at, status) FROM stdin;
    public               postgres    false    239   ��       �          0    16642    siswaglr 
   TABLE DATA           L   COPY public.siswaglr (id, siswapost_id, created_at, updated_at) FROM stdin;
    public               postgres    false    241   ��       �          0    16648    web_settings 
   TABLE DATA           K   COPY public.web_settings (id, component, settings, updated_at) FROM stdin;
    public               postgres    false    243   ص       �           0    0    agenda_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.agenda_id_seq', 19, true);
          public               postgres    false    218            �           0    0    foto_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.foto_id_seq', 103, true);
          public               postgres    false    220            �           0    0    foto_siswa_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.foto_siswa_id_seq', 18, true);
          public               postgres    false    222            �           0    0    galery_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.galery_id_seq', 48, true);
          public               postgres    false    224            �           0    0    kategori_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.kategori_id_seq', 1, false);
          public               postgres    false    226            �           0    0    notifications_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.notifications_id_seq', 12, true);
          public               postgres    false    228            �           0    0    petugas_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.petugas_id_seq', 2, true);
          public               postgres    false    230            �           0    0    post_comments_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.post_comments_id_seq', 8, true);
          public               postgres    false    247            �           0    0    post_likes_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.post_likes_id_seq', 9, true);
          public               postgres    false    245            �           0    0    posts_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.posts_id_seq', 26, true);
          public               postgres    false    232            �           0    0    profile_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.profile_id_seq', 5, true);
          public               postgres    false    234            �           0    0    siswa_post_comments_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.siswa_post_comments_id_seq', 47, true);
          public               postgres    false    236            �           0    0    siswa_post_likes_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.siswa_post_likes_id_seq', 26, true);
          public               postgres    false    238            �           0    0    siswa_posts_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.siswa_posts_id_seq', 27, true);
          public               postgres    false    240            �           0    0    siswaglr_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.siswaglr_id_seq', 16, true);
          public               postgres    false    242            �           0    0    web_settings_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.web_settings_id_seq', 123, true);
          public               postgres    false    244            �           2606    16670    agenda agenda_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.agenda
    ADD CONSTRAINT agenda_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.agenda DROP CONSTRAINT agenda_pkey;
       public                 postgres    false    217            �           2606    16672    foto foto_pkey 
   CONSTRAINT     L   ALTER TABLE ONLY public.foto
    ADD CONSTRAINT foto_pkey PRIMARY KEY (id);
 8   ALTER TABLE ONLY public.foto DROP CONSTRAINT foto_pkey;
       public                 postgres    false    219            �           2606    16674    foto_siswa foto_siswa_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.foto_siswa
    ADD CONSTRAINT foto_siswa_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.foto_siswa DROP CONSTRAINT foto_siswa_pkey;
       public                 postgres    false    221            �           2606    16676    galery galery_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.galery
    ADD CONSTRAINT galery_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.galery DROP CONSTRAINT galery_pkey;
       public                 postgres    false    223            �           2606    16678    kategori kategori_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.kategori
    ADD CONSTRAINT kategori_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.kategori DROP CONSTRAINT kategori_pkey;
       public                 postgres    false    225            �           2606    16680     notifications notifications_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.notifications DROP CONSTRAINT notifications_pkey;
       public                 postgres    false    227            �           2606    16682    petugas petugas_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.petugas
    ADD CONSTRAINT petugas_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.petugas DROP CONSTRAINT petugas_pkey;
       public                 postgres    false    229            �           2606    16809     post_comments post_comments_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.post_comments
    ADD CONSTRAINT post_comments_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.post_comments DROP CONSTRAINT post_comments_pkey;
       public                 postgres    false    248            �           2606    16791    post_likes post_likes_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.post_likes DROP CONSTRAINT post_likes_pkey;
       public                 postgres    false    246            �           2606    16793 ,   post_likes post_likes_post_id_ip_address_key 
   CONSTRAINT     v   ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_post_id_ip_address_key UNIQUE (post_id, ip_address);
 V   ALTER TABLE ONLY public.post_likes DROP CONSTRAINT post_likes_post_id_ip_address_key;
       public                 postgres    false    246    246            �           2606    16684    posts posts_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.posts DROP CONSTRAINT posts_pkey;
       public                 postgres    false    231            �           2606    16686    profile profile_email_key 
   CONSTRAINT     U   ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profile_email_key UNIQUE (email);
 C   ALTER TABLE ONLY public.profile DROP CONSTRAINT profile_email_key;
       public                 postgres    false    233            �           2606    16688    profile profile_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profile_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.profile DROP CONSTRAINT profile_pkey;
       public                 postgres    false    233            �           2606    16690    profile profile_username_key 
   CONSTRAINT     [   ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profile_username_key UNIQUE (username);
 F   ALTER TABLE ONLY public.profile DROP CONSTRAINT profile_username_key;
       public                 postgres    false    233            �           2606    16692 ,   siswa_post_comments siswa_post_comments_pkey 
   CONSTRAINT     j   ALTER TABLE ONLY public.siswa_post_comments
    ADD CONSTRAINT siswa_post_comments_pkey PRIMARY KEY (id);
 V   ALTER TABLE ONLY public.siswa_post_comments DROP CONSTRAINT siswa_post_comments_pkey;
       public                 postgres    false    235            �           2606    16694 &   siswa_post_likes siswa_post_likes_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.siswa_post_likes
    ADD CONSTRAINT siswa_post_likes_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.siswa_post_likes DROP CONSTRAINT siswa_post_likes_pkey;
       public                 postgres    false    237            �           2606    16696 =   siswa_post_likes siswa_post_likes_siswapost_id_profile_id_key 
   CONSTRAINT     �   ALTER TABLE ONLY public.siswa_post_likes
    ADD CONSTRAINT siswa_post_likes_siswapost_id_profile_id_key UNIQUE (siswapost_id, profile_id);
 g   ALTER TABLE ONLY public.siswa_post_likes DROP CONSTRAINT siswa_post_likes_siswapost_id_profile_id_key;
       public                 postgres    false    237    237            �           2606    16698    siswa_posts siswa_posts_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.siswa_posts
    ADD CONSTRAINT siswa_posts_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.siswa_posts DROP CONSTRAINT siswa_posts_pkey;
       public                 postgres    false    239            �           2606    16700    siswaglr siswaglr_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.siswaglr
    ADD CONSTRAINT siswaglr_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.siswaglr DROP CONSTRAINT siswaglr_pkey;
       public                 postgres    false    241            �           2606    16702 '   web_settings web_settings_component_key 
   CONSTRAINT     g   ALTER TABLE ONLY public.web_settings
    ADD CONSTRAINT web_settings_component_key UNIQUE (component);
 Q   ALTER TABLE ONLY public.web_settings DROP CONSTRAINT web_settings_component_key;
       public                 postgres    false    243            �           2606    16704    web_settings web_settings_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.web_settings
    ADD CONSTRAINT web_settings_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.web_settings DROP CONSTRAINT web_settings_pkey;
       public                 postgres    false    243            �           1259    16705    idx_foto_siswa_siswaglr_id    INDEX     X   CREATE INDEX idx_foto_siswa_siswaglr_id ON public.foto_siswa USING btree (siswaglr_id);
 .   DROP INDEX public.idx_foto_siswa_siswaglr_id;
       public                 postgres    false    221            �           1259    16706    idx_profile_email    INDEX     F   CREATE INDEX idx_profile_email ON public.profile USING btree (email);
 %   DROP INDEX public.idx_profile_email;
       public                 postgres    false    233            �           1259    16707    idx_profile_username    INDEX     L   CREATE INDEX idx_profile_username ON public.profile USING btree (username);
 (   DROP INDEX public.idx_profile_username;
       public                 postgres    false    233            �           1259    16708    idx_siswaglr_siswapost_id    INDEX     V   CREATE INDEX idx_siswaglr_siswapost_id ON public.siswaglr USING btree (siswapost_id);
 -   DROP INDEX public.idx_siswaglr_siswapost_id;
       public                 postgres    false    241                       2620    16709 '   foto_siswa update_foto_siswa_updated_at    TRIGGER     �   CREATE TRIGGER update_foto_siswa_updated_at BEFORE UPDATE ON public.foto_siswa FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 @   DROP TRIGGER update_foto_siswa_updated_at ON public.foto_siswa;
       public               postgres    false    221    249                       2620    16710 !   profile update_profile_updated_at    TRIGGER     �   CREATE TRIGGER update_profile_updated_at BEFORE UPDATE ON public.profile FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 :   DROP TRIGGER update_profile_updated_at ON public.profile;
       public               postgres    false    249    233                       2620    16711 )   siswa_posts update_siswa_posts_updated_at    TRIGGER     �   CREATE TRIGGER update_siswa_posts_updated_at BEFORE UPDATE ON public.siswa_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 B   DROP TRIGGER update_siswa_posts_updated_at ON public.siswa_posts;
       public               postgres    false    249    239                       2620    16712 #   siswaglr update_siswaglr_updated_at    TRIGGER     �   CREATE TRIGGER update_siswaglr_updated_at BEFORE UPDATE ON public.siswaglr FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 <   DROP TRIGGER update_siswaglr_updated_at ON public.siswaglr;
       public               postgres    false    241    249                        2606    16713    foto foto_galery_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.foto
    ADD CONSTRAINT foto_galery_id_fkey FOREIGN KEY (galery_id) REFERENCES public.galery(id) ON DELETE CASCADE;
 B   ALTER TABLE ONLY public.foto DROP CONSTRAINT foto_galery_id_fkey;
       public               postgres    false    4826    219    223                       2606    16718 &   foto_siswa foto_siswa_siswaglr_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.foto_siswa
    ADD CONSTRAINT foto_siswa_siswaglr_id_fkey FOREIGN KEY (siswaglr_id) REFERENCES public.siswaglr(id) ON DELETE CASCADE;
 P   ALTER TABLE ONLY public.foto_siswa DROP CONSTRAINT foto_siswa_siswaglr_id_fkey;
       public               postgres    false    241    4853    221                       2606    16723 (   notifications notifications_post_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.siswa_posts(id);
 R   ALTER TABLE ONLY public.notifications DROP CONSTRAINT notifications_post_id_fkey;
       public               postgres    false    227    4850    239                       2606    16728 -   notifications notifications_recipient_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.profile(id);
 W   ALTER TABLE ONLY public.notifications DROP CONSTRAINT notifications_recipient_id_fkey;
       public               postgres    false    227    4840    233                       2606    16733 *   notifications notifications_sender_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profile(id);
 T   ALTER TABLE ONLY public.notifications DROP CONSTRAINT notifications_sender_id_fkey;
       public               postgres    false    227    4840    233                       2606    16810 (   post_comments post_comments_post_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.post_comments
    ADD CONSTRAINT post_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;
 R   ALTER TABLE ONLY public.post_comments DROP CONSTRAINT post_comments_post_id_fkey;
       public               postgres    false    4834    231    248                       2606    16794 "   post_likes post_likes_post_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;
 L   ALTER TABLE ONLY public.post_likes DROP CONSTRAINT post_likes_post_id_fkey;
       public               postgres    false    231    4834    246                       2606    16738    posts posts_kategori_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_kategori_id_fkey FOREIGN KEY (kategori_id) REFERENCES public.kategori(id) ON DELETE SET NULL;
 F   ALTER TABLE ONLY public.posts DROP CONSTRAINT posts_kategori_id_fkey;
       public               postgres    false    4828    231    225                       2606    16743    posts posts_petugas_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_petugas_id_fkey FOREIGN KEY (petugas_id) REFERENCES public.petugas(id) ON DELETE SET NULL;
 E   ALTER TABLE ONLY public.posts DROP CONSTRAINT posts_petugas_id_fkey;
       public               postgres    false    231    4832    229                       2606    16748 4   siswa_post_comments siswa_post_comments_post_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.siswa_post_comments
    ADD CONSTRAINT siswa_post_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.siswa_posts(id) ON DELETE CASCADE;
 ^   ALTER TABLE ONLY public.siswa_post_comments DROP CONSTRAINT siswa_post_comments_post_id_fkey;
       public               postgres    false    235    4850    239                       2606    16753 7   siswa_post_comments siswa_post_comments_profile_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.siswa_post_comments
    ADD CONSTRAINT siswa_post_comments_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id) ON DELETE CASCADE;
 a   ALTER TABLE ONLY public.siswa_post_comments DROP CONSTRAINT siswa_post_comments_profile_id_fkey;
       public               postgres    false    235    4840    233            	           2606    16758 1   siswa_post_likes siswa_post_likes_profile_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.siswa_post_likes
    ADD CONSTRAINT siswa_post_likes_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id);
 [   ALTER TABLE ONLY public.siswa_post_likes DROP CONSTRAINT siswa_post_likes_profile_id_fkey;
       public               postgres    false    237    4840    233            
           2606    16763 3   siswa_post_likes siswa_post_likes_siswapost_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.siswa_post_likes
    ADD CONSTRAINT siswa_post_likes_siswapost_id_fkey FOREIGN KEY (siswapost_id) REFERENCES public.siswa_posts(id);
 ]   ALTER TABLE ONLY public.siswa_post_likes DROP CONSTRAINT siswa_post_likes_siswapost_id_fkey;
       public               postgres    false    4850    239    237                       2606    16768 '   siswa_posts siswa_posts_profile_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.siswa_posts
    ADD CONSTRAINT siswa_posts_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id);
 Q   ALTER TABLE ONLY public.siswa_posts DROP CONSTRAINT siswa_posts_profile_id_fkey;
       public               postgres    false    4840    239    233                       2606    16773 #   siswaglr siswaglr_siswapost_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.siswaglr
    ADD CONSTRAINT siswaglr_siswapost_id_fkey FOREIGN KEY (siswapost_id) REFERENCES public.siswa_posts(id) ON DELETE CASCADE;
 M   ALTER TABLE ONLY public.siswaglr DROP CONSTRAINT siswaglr_siswapost_id_fkey;
       public               postgres    false    241    239    4850            �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �     