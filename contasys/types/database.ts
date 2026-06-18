export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          nombre: string;
          email: string;
          avatar_url: string | null;
          rol_plataforma: "superadmin" | "usuario";
          creado_en: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          email: string;
          avatar_url?: string | null;
          rol_plataforma?: "superadmin" | "usuario";
          creado_en?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          email?: string;
          avatar_url?: string | null;
          rol_plataforma?: "superadmin" | "usuario";
          creado_en?: string;
        };
      };
      empresas: {
        Row: {
          id: string;
          nombre: string;
          razon_social: string;
          ruc: string;
          logo_url: string | null;
          email: string | null;
          telefono: string | null;
          direccion: string | null;
          ciudad: string | null;
          provincia: string | null;
          regimen_tributario: string | null;
          tipo_contribuyente: string | null;
          ambiente: "pruebas" | "produccion";
          estado: "activa" | "suspendida" | "prueba";
          creado_en: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          razon_social: string;
          ruc: string;
          logo_url?: string | null;
          email?: string | null;
          telefono?: string | null;
          direccion?: string | null;
          ciudad?: string | null;
          provincia?: string | null;
          regimen_tributario?: string | null;
          tipo_contribuyente?: string | null;
          ambiente?: "pruebas" | "produccion";
          estado?: "activa" | "suspendida" | "prueba";
          creado_en?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          razon_social?: string;
          ruc?: string;
          logo_url?: string | null;
          email?: string | null;
          telefono?: string | null;
          direccion?: string | null;
          ciudad?: string | null;
          provincia?: string | null;
          regimen_tributario?: string | null;
          tipo_contribuyente?: string | null;
          ambiente?: "pruebas" | "produccion";
          estado?: "activa" | "suspendida" | "prueba";
          creado_en?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
