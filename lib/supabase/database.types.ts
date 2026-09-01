export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      audit_events: {
        Row: {
          actor_id: string | null;
          actor_kind: string;
          after_value: Json | null;
          before_value: Json | null;
          entity_id: string | null;
          id: number;
          occurred_at: string;
          operation: string;
          table_name: string;
          transaction_id: number;
        };
        Insert: {
          actor_id?: string | null;
          actor_kind: string;
          after_value?: Json | null;
          before_value?: Json | null;
          entity_id?: string | null;
          id?: never;
          occurred_at?: string;
          operation: string;
          table_name: string;
          transaction_id?: number;
        };
        Update: {
          actor_id?: string | null;
          actor_kind?: string;
          after_value?: Json | null;
          before_value?: Json | null;
          entity_id?: string | null;
          id?: never;
          occurred_at?: string;
          operation?: string;
          table_name?: string;
          transaction_id?: number;
        };
        Relationships: [];
      };
      compatibility_entities: {
        Row: {
          created_at: string;
          entity_type: string;
          external_key: string;
          id: string;
          label: string;
          product_series_id: string | null;
          product_variant_id: string | null;
          raw_snapshot: Json;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          entity_type: string;
          external_key: string;
          id?: string;
          label: string;
          product_series_id?: string | null;
          product_variant_id?: string | null;
          raw_snapshot?: Json;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          entity_type?: string;
          external_key?: string;
          id?: string;
          label?: string;
          product_series_id?: string | null;
          product_variant_id?: string | null;
          raw_snapshot?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "compatibility_entities_product_series_id_fkey";
            columns: ["product_series_id"];
            isOneToOne: false;
            referencedRelation: "product_series";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "compatibility_entities_product_variant_id_fkey";
            columns: ["product_variant_id"];
            isOneToOne: false;
            referencedRelation: "pi_variant_readiness";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "compatibility_entities_product_variant_id_fkey";
            columns: ["product_variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      compatibility_evidence: {
        Row: {
          compatibility_relationship_id: string;
          created_at: string;
          evidence_role: string;
          evidence_source_id: string;
        };
        Insert: {
          compatibility_relationship_id: string;
          created_at?: string;
          evidence_role?: string;
          evidence_source_id: string;
        };
        Update: {
          compatibility_relationship_id?: string;
          created_at?: string;
          evidence_role?: string;
          evidence_source_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "compatibility_evidence_compatibility_relationship_id_fkey";
            columns: ["compatibility_relationship_id"];
            isOneToOne: false;
            referencedRelation: "compatibility_relationships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "compatibility_evidence_evidence_source_id_fkey";
            columns: ["evidence_source_id"];
            isOneToOne: false;
            referencedRelation: "evidence_sources";
            referencedColumns: ["id"];
          },
        ];
      };
      compatibility_relationships: {
        Row: {
          buyer_confirmation_required: boolean;
          confirmation_requirements: string[];
          confirmed_at: string | null;
          confirmed_by: string | null;
          created_at: string;
          external_key: string;
          id: string;
          legacy_reviewed_by: string | null;
          legacy_reviewed_date: string | null;
          raw_snapshot: Json;
          relationship_status: string;
          relationship_type: string;
          role: string;
          source_level: Database["public"]["Enums"]["pi_source_level"];
          source_type: string;
          subject_entity_id: string;
          target_entity_id: string;
          updated_at: string;
          verification_status: Database["public"]["Enums"]["pi_verification_status"];
        };
        Insert: {
          buyer_confirmation_required?: boolean;
          confirmation_requirements?: string[];
          confirmed_at?: string | null;
          confirmed_by?: string | null;
          created_at?: string;
          external_key: string;
          id?: string;
          legacy_reviewed_by?: string | null;
          legacy_reviewed_date?: string | null;
          raw_snapshot?: Json;
          relationship_status: string;
          relationship_type: string;
          role: string;
          source_level: Database["public"]["Enums"]["pi_source_level"];
          source_type: string;
          subject_entity_id: string;
          target_entity_id: string;
          updated_at?: string;
          verification_status: Database["public"]["Enums"]["pi_verification_status"];
        };
        Update: {
          buyer_confirmation_required?: boolean;
          confirmation_requirements?: string[];
          confirmed_at?: string | null;
          confirmed_by?: string | null;
          created_at?: string;
          external_key?: string;
          id?: string;
          legacy_reviewed_by?: string | null;
          legacy_reviewed_date?: string | null;
          raw_snapshot?: Json;
          relationship_status?: string;
          relationship_type?: string;
          role?: string;
          source_level?: Database["public"]["Enums"]["pi_source_level"];
          source_type?: string;
          subject_entity_id?: string;
          target_entity_id?: string;
          updated_at?: string;
          verification_status?: Database["public"]["Enums"]["pi_verification_status"];
        };
        Relationships: [
          {
            foreignKeyName: "compatibility_relationships_subject_entity_id_fkey";
            columns: ["subject_entity_id"];
            isOneToOne: false;
            referencedRelation: "compatibility_entities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "compatibility_relationships_target_entity_id_fkey";
            columns: ["target_entity_id"];
            isOneToOne: false;
            referencedRelation: "compatibility_entities";
            referencedColumns: ["id"];
          },
        ];
      };
      console_user_roles: {
        Row: {
          granted_at: string;
          granted_by: string | null;
          revoked_at: string | null;
          role: Database["public"]["Enums"]["pi_console_role"];
          user_id: string;
        };
        Insert: {
          granted_at?: string;
          granted_by?: string | null;
          revoked_at?: string | null;
          role: Database["public"]["Enums"]["pi_console_role"];
          user_id: string;
        };
        Update: {
          granted_at?: string;
          granted_by?: string | null;
          revoked_at?: string | null;
          role?: Database["public"]["Enums"]["pi_console_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      entity_documents: {
        Row: {
          created_at: string;
          id: string;
          product_series_id: string | null;
          product_variant_id: string | null;
          relationship_role: string;
          series_component_id: string | null;
          technical_document_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          product_series_id?: string | null;
          product_variant_id?: string | null;
          relationship_role: string;
          series_component_id?: string | null;
          technical_document_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          product_series_id?: string | null;
          product_variant_id?: string | null;
          relationship_role?: string;
          series_component_id?: string | null;
          technical_document_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "entity_documents_product_series_id_fkey";
            columns: ["product_series_id"];
            isOneToOne: false;
            referencedRelation: "product_series";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "entity_documents_product_variant_id_fkey";
            columns: ["product_variant_id"];
            isOneToOne: false;
            referencedRelation: "pi_variant_readiness";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "entity_documents_product_variant_id_fkey";
            columns: ["product_variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "entity_documents_series_component_id_fkey";
            columns: ["series_component_id"];
            isOneToOne: false;
            referencedRelation: "series_components";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "entity_documents_technical_document_id_fkey";
            columns: ["technical_document_id"];
            isOneToOne: false;
            referencedRelation: "technical_documents";
            referencedColumns: ["id"];
          },
        ];
      };
      evidence_sources: {
        Row: {
          created_at: string;
          evidence_date: string | null;
          exact_subject: boolean;
          external_key: string;
          file_hash: string | null;
          id: string;
          owner_name: string | null;
          private_storage_path: string | null;
          raw_snapshot: Json;
          source_level: Database["public"]["Enums"]["pi_source_level"] | null;
          source_reference: string;
          source_type: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          evidence_date?: string | null;
          exact_subject?: boolean;
          external_key: string;
          file_hash?: string | null;
          id?: string;
          owner_name?: string | null;
          private_storage_path?: string | null;
          raw_snapshot?: Json;
          source_level?: Database["public"]["Enums"]["pi_source_level"] | null;
          source_reference: string;
          source_type: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          evidence_date?: string | null;
          exact_subject?: boolean;
          external_key?: string;
          file_hash?: string | null;
          id?: string;
          owner_name?: string | null;
          private_storage_path?: string | null;
          raw_snapshot?: Json;
          source_level?: Database["public"]["Enums"]["pi_source_level"] | null;
          source_reference?: string;
          source_type?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      import_batches: {
        Row: {
          completed_at: string | null;
          created_at: string;
          created_by: string | null;
          expected_counts: Json;
          failure_message: string | null;
          id: string;
          imported_counts: Json | null;
          is_shadow: boolean;
          reconciliation: Json | null;
          source_files: Json;
          source_kind: string;
          source_revision: string;
          status: Database["public"]["Enums"]["pi_import_status"];
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          expected_counts: Json;
          failure_message?: string | null;
          id: string;
          imported_counts?: Json | null;
          is_shadow?: boolean;
          reconciliation?: Json | null;
          source_files: Json;
          source_kind: string;
          source_revision: string;
          status?: Database["public"]["Enums"]["pi_import_status"];
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          expected_counts?: Json;
          failure_message?: string | null;
          id?: string;
          imported_counts?: Json | null;
          is_shadow?: boolean;
          reconciliation?: Json | null;
          source_files?: Json;
          source_kind?: string;
          source_revision?: string;
          status?: Database["public"]["Enums"]["pi_import_status"];
        };
        Relationships: [];
      };
      import_rows: {
        Row: {
          created_at: string;
          errors: string[];
          id: string;
          import_batch_id: string;
          normalized_payload: Json;
          raw_payload: Json;
          row_number: number;
          source_record_key: string;
          warnings: string[];
        };
        Insert: {
          created_at?: string;
          errors?: string[];
          id: string;
          import_batch_id: string;
          normalized_payload?: Json;
          raw_payload?: Json;
          row_number: number;
          source_record_key: string;
          warnings?: string[];
        };
        Update: {
          created_at?: string;
          errors?: string[];
          id?: string;
          import_batch_id?: string;
          normalized_payload?: Json;
          raw_payload?: Json;
          row_number?: number;
          source_record_key?: string;
          warnings?: string[];
        };
        Relationships: [
          {
            foreignKeyName: "import_rows_import_batch_id_fkey";
            columns: ["import_batch_id"];
            isOneToOne: false;
            referencedRelation: "import_batches";
            referencedColumns: ["id"];
          },
        ];
      };
      media_assets: {
        Row: {
          approved_at: string | null;
          approved_by: string | null;
          content_match_status: string;
          created_at: string;
          external_key: string;
          file_hash: string | null;
          height: number | null;
          id: string;
          legacy_reviewed_by: string | null;
          legacy_reviewed_date: string | null;
          mime_type: string | null;
          ownership_status: string;
          public_path: string | null;
          publication_status: string;
          raw_snapshot: Json;
          source_file: string | null;
          source_kind: string;
          source_owner: string | null;
          source_reference: string;
          storage_bucket: string | null;
          storage_path: string | null;
          updated_at: string;
          usage_rights_status: string;
          width: number | null;
        };
        Insert: {
          approved_at?: string | null;
          approved_by?: string | null;
          content_match_status: string;
          created_at?: string;
          external_key: string;
          file_hash?: string | null;
          height?: number | null;
          id?: string;
          legacy_reviewed_by?: string | null;
          legacy_reviewed_date?: string | null;
          mime_type?: string | null;
          ownership_status: string;
          public_path?: string | null;
          publication_status: string;
          raw_snapshot?: Json;
          source_file?: string | null;
          source_kind: string;
          source_owner?: string | null;
          source_reference: string;
          storage_bucket?: string | null;
          storage_path?: string | null;
          updated_at?: string;
          usage_rights_status: string;
          width?: number | null;
        };
        Update: {
          approved_at?: string | null;
          approved_by?: string | null;
          content_match_status?: string;
          created_at?: string;
          external_key?: string;
          file_hash?: string | null;
          height?: number | null;
          id?: string;
          legacy_reviewed_by?: string | null;
          legacy_reviewed_date?: string | null;
          mime_type?: string | null;
          ownership_status?: string;
          public_path?: string | null;
          publication_status?: string;
          raw_snapshot?: Json;
          source_file?: string | null;
          source_kind?: string;
          source_owner?: string | null;
          source_reference?: string;
          storage_bucket?: string | null;
          storage_path?: string | null;
          updated_at?: string;
          usage_rights_status?: string;
          width?: number | null;
        };
        Relationships: [];
      };
      oem_references: {
        Row: {
          confirmed_at: string | null;
          confirmed_by: string | null;
          created_at: string;
          evidence_source_id: string | null;
          external_key: string;
          id: string;
          manufacturer_name: string | null;
          product_variant_id: string | null;
          raw_snapshot: Json;
          reference_number: string;
          series_component_id: string | null;
          source_level: Database["public"]["Enums"]["pi_source_level"];
          updated_at: string;
          verification_status: Database["public"]["Enums"]["pi_verification_status"];
        };
        Insert: {
          confirmed_at?: string | null;
          confirmed_by?: string | null;
          created_at?: string;
          evidence_source_id?: string | null;
          external_key: string;
          id?: string;
          manufacturer_name?: string | null;
          product_variant_id?: string | null;
          raw_snapshot?: Json;
          reference_number: string;
          series_component_id?: string | null;
          source_level: Database["public"]["Enums"]["pi_source_level"];
          updated_at?: string;
          verification_status: Database["public"]["Enums"]["pi_verification_status"];
        };
        Update: {
          confirmed_at?: string | null;
          confirmed_by?: string | null;
          created_at?: string;
          evidence_source_id?: string | null;
          external_key?: string;
          id?: string;
          manufacturer_name?: string | null;
          product_variant_id?: string | null;
          raw_snapshot?: Json;
          reference_number?: string;
          series_component_id?: string | null;
          source_level?: Database["public"]["Enums"]["pi_source_level"];
          updated_at?: string;
          verification_status?: Database["public"]["Enums"]["pi_verification_status"];
        };
        Relationships: [
          {
            foreignKeyName: "oem_references_evidence_source_id_fkey";
            columns: ["evidence_source_id"];
            isOneToOne: false;
            referencedRelation: "evidence_sources";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "oem_references_product_variant_id_fkey";
            columns: ["product_variant_id"];
            isOneToOne: false;
            referencedRelation: "pi_variant_readiness";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "oem_references_product_variant_id_fkey";
            columns: ["product_variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "oem_references_series_component_id_fkey";
            columns: ["series_component_id"];
            isOneToOne: false;
            referencedRelation: "series_components";
            referencedColumns: ["id"];
          },
        ];
      };
      packaging_records: {
        Row: {
          confirmed_at: string | null;
          confirmed_by: string | null;
          created_at: string;
          evidence_source_id: string | null;
          external_key: string;
          id: string;
          lead_time_note: string;
          moq_note: string;
          package_description: string;
          product_variant_id: string;
          quantity: number | null;
          quantity_unit: string | null;
          raw_snapshot: Json;
          source_level: Database["public"]["Enums"]["pi_source_level"] | null;
          updated_at: string;
          verification_status: Database["public"]["Enums"]["pi_verification_status"];
        };
        Insert: {
          confirmed_at?: string | null;
          confirmed_by?: string | null;
          created_at?: string;
          evidence_source_id?: string | null;
          external_key: string;
          id?: string;
          lead_time_note: string;
          moq_note: string;
          package_description: string;
          product_variant_id: string;
          quantity?: number | null;
          quantity_unit?: string | null;
          raw_snapshot?: Json;
          source_level?: Database["public"]["Enums"]["pi_source_level"] | null;
          updated_at?: string;
          verification_status: Database["public"]["Enums"]["pi_verification_status"];
        };
        Update: {
          confirmed_at?: string | null;
          confirmed_by?: string | null;
          created_at?: string;
          evidence_source_id?: string | null;
          external_key?: string;
          id?: string;
          lead_time_note?: string;
          moq_note?: string;
          package_description?: string;
          product_variant_id?: string;
          quantity?: number | null;
          quantity_unit?: string | null;
          raw_snapshot?: Json;
          source_level?: Database["public"]["Enums"]["pi_source_level"] | null;
          updated_at?: string;
          verification_status?: Database["public"]["Enums"]["pi_verification_status"];
        };
        Relationships: [
          {
            foreignKeyName: "packaging_records_evidence_source_id_fkey";
            columns: ["evidence_source_id"];
            isOneToOne: false;
            referencedRelation: "evidence_sources";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "packaging_records_product_variant_id_fkey";
            columns: ["product_variant_id"];
            isOneToOne: false;
            referencedRelation: "pi_variant_readiness";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "packaging_records_product_variant_id_fkey";
            columns: ["product_variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      product_categories: {
        Row: {
          created_at: string;
          external_key: string;
          id: string;
          name_en: string;
          name_zh: string | null;
          raw_snapshot: Json;
          route_slug: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          external_key: string;
          id?: string;
          name_en: string;
          name_zh?: string | null;
          raw_snapshot?: Json;
          route_slug: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          external_key?: string;
          id?: string;
          name_en?: string;
          name_zh?: string | null;
          raw_snapshot?: Json;
          route_slug?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_media: {
        Row: {
          alt_text: string;
          created_at: string;
          id: string;
          media_asset_id: string;
          product_variant_id: string;
          raw_snapshot: Json;
          role: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          alt_text: string;
          created_at?: string;
          id?: string;
          media_asset_id: string;
          product_variant_id: string;
          raw_snapshot?: Json;
          role: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          alt_text?: string;
          created_at?: string;
          id?: string;
          media_asset_id?: string;
          product_variant_id?: string;
          raw_snapshot?: Json;
          role?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_media_media_asset_id_fkey";
            columns: ["media_asset_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_media_product_variant_id_fkey";
            columns: ["product_variant_id"];
            isOneToOne: false;
            referencedRelation: "pi_variant_readiness";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_media_product_variant_id_fkey";
            columns: ["product_variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      product_series: {
        Row: {
          approved_at: string | null;
          approved_by: string | null;
          category_id: string;
          created_at: string;
          external_key: string;
          id: string;
          image_evidence_status: string;
          name: string;
          process: string;
          publication_status: string;
          raw_snapshot: Json;
          slug: string;
          source_level: Database["public"]["Enums"]["pi_source_level"];
          source_reference: string;
          source_type: string;
          updated_at: string;
          verification_status: Database["public"]["Enums"]["pi_verification_status"];
        };
        Insert: {
          approved_at?: string | null;
          approved_by?: string | null;
          category_id: string;
          created_at?: string;
          external_key: string;
          id?: string;
          image_evidence_status?: string;
          name: string;
          process: string;
          publication_status?: string;
          raw_snapshot?: Json;
          slug: string;
          source_level: Database["public"]["Enums"]["pi_source_level"];
          source_reference: string;
          source_type: string;
          updated_at?: string;
          verification_status: Database["public"]["Enums"]["pi_verification_status"];
        };
        Update: {
          approved_at?: string | null;
          approved_by?: string | null;
          category_id?: string;
          created_at?: string;
          external_key?: string;
          id?: string;
          image_evidence_status?: string;
          name?: string;
          process?: string;
          publication_status?: string;
          raw_snapshot?: Json;
          slug?: string;
          source_level?: Database["public"]["Enums"]["pi_source_level"];
          source_reference?: string;
          source_type?: string;
          updated_at?: string;
          verification_status?: Database["public"]["Enums"]["pi_verification_status"];
        };
        Relationships: [
          {
            foreignKeyName: "product_series_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "product_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variants: {
        Row: {
          category_id: string;
          created_at: string;
          id: string;
          is_shadow: boolean;
          legacy_compatibility_status: string;
          legacy_data_status: string;
          legacy_image_status: string;
          legacy_oem_status: string;
          legacy_status: string;
          lifecycle_changed_at: string;
          lifecycle_changed_by: string | null;
          lifecycle_state: Database["public"]["Enums"]["pi_product_lifecycle"];
          model: string | null;
          product_id: string;
          public_slug: string;
          raw_snapshot: Json;
          sku: string;
          updated_at: string;
        };
        Insert: {
          category_id: string;
          created_at?: string;
          id?: string;
          is_shadow?: boolean;
          legacy_compatibility_status: string;
          legacy_data_status: string;
          legacy_image_status: string;
          legacy_oem_status: string;
          legacy_status: string;
          lifecycle_changed_at?: string;
          lifecycle_changed_by?: string | null;
          lifecycle_state?: Database["public"]["Enums"]["pi_product_lifecycle"];
          model?: string | null;
          product_id: string;
          public_slug: string;
          raw_snapshot?: Json;
          sku: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          created_at?: string;
          id?: string;
          is_shadow?: boolean;
          legacy_compatibility_status?: string;
          legacy_data_status?: string;
          legacy_image_status?: string;
          legacy_oem_status?: string;
          legacy_status?: string;
          lifecycle_changed_at?: string;
          lifecycle_changed_by?: string | null;
          lifecycle_state?: Database["public"]["Enums"]["pi_product_lifecycle"];
          model?: string | null;
          product_id?: string;
          public_slug?: string;
          raw_snapshot?: Json;
          sku?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "product_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          category_id: string;
          created_at: string;
          external_key: string;
          id: string;
          name_en: string;
          name_zh: string | null;
          product_type: string;
          raw_snapshot: Json;
          source_reference: string | null;
          source_type: string;
          updated_at: string;
        };
        Insert: {
          category_id: string;
          created_at?: string;
          external_key: string;
          id?: string;
          name_en: string;
          name_zh?: string | null;
          product_type: string;
          raw_snapshot?: Json;
          source_reference?: string | null;
          source_type: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          created_at?: string;
          external_key?: string;
          id?: string;
          name_en?: string;
          name_zh?: string | null;
          product_type?: string;
          raw_snapshot?: Json;
          source_reference?: string | null;
          source_type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "product_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      publish_records: {
        Row: {
          commit_sha: string | null;
          deployment_id: string | null;
          destination: string;
          id: string;
          live_verification: Json | null;
          published_at: string;
          published_by: string;
          release_candidate_id: string;
          rollback_release_id: string | null;
          snapshot_hash: string;
        };
        Insert: {
          commit_sha?: string | null;
          deployment_id?: string | null;
          destination: string;
          id?: string;
          live_verification?: Json | null;
          published_at?: string;
          published_by: string;
          release_candidate_id: string;
          rollback_release_id?: string | null;
          snapshot_hash: string;
        };
        Update: {
          commit_sha?: string | null;
          deployment_id?: string | null;
          destination?: string;
          id?: string;
          live_verification?: Json | null;
          published_at?: string;
          published_by?: string;
          release_candidate_id?: string;
          rollback_release_id?: string | null;
          snapshot_hash?: string;
        };
        Relationships: [
          {
            foreignKeyName: "publish_records_release_candidate_id_fkey";
            columns: ["release_candidate_id"];
            isOneToOne: true;
            referencedRelation: "release_candidates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "publish_records_rollback_release_id_fkey";
            columns: ["rollback_release_id"];
            isOneToOne: false;
            referencedRelation: "release_candidates";
            referencedColumns: ["id"];
          },
        ];
      };
      release_candidates: {
        Row: {
          approved_at: string | null;
          approved_by: string | null;
          created_at: string;
          created_by: string;
          current_qa_run_id: string | null;
          frozen_snapshot_hash: string | null;
          id: string;
          intended_destination: string;
          release_key: string;
          source_revision: string;
          status: Database["public"]["Enums"]["pi_release_status"];
          updated_at: string;
        };
        Insert: {
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          created_by: string;
          current_qa_run_id?: string | null;
          frozen_snapshot_hash?: string | null;
          id?: string;
          intended_destination: string;
          release_key: string;
          source_revision: string;
          status?: Database["public"]["Enums"]["pi_release_status"];
          updated_at?: string;
        };
        Update: {
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          created_by?: string;
          current_qa_run_id?: string | null;
          frozen_snapshot_hash?: string | null;
          id?: string;
          intended_destination?: string;
          release_key?: string;
          source_revision?: string;
          status?: Database["public"]["Enums"]["pi_release_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      release_items: {
        Row: {
          blocker_count: number;
          created_at: string;
          entity_key: string;
          entity_type: string;
          frozen_snapshot: Json;
          id: string;
          release_candidate_id: string;
          warning_count: number;
        };
        Insert: {
          blocker_count?: number;
          created_at?: string;
          entity_key: string;
          entity_type: string;
          frozen_snapshot: Json;
          id?: string;
          release_candidate_id: string;
          warning_count?: number;
        };
        Update: {
          blocker_count?: number;
          created_at?: string;
          entity_key?: string;
          entity_type?: string;
          frozen_snapshot?: Json;
          id?: string;
          release_candidate_id?: string;
          warning_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "release_items_release_candidate_id_fkey";
            columns: ["release_candidate_id"];
            isOneToOne: false;
            referencedRelation: "release_candidates";
            referencedColumns: ["id"];
          },
        ];
      };
      release_qa_results: {
        Row: {
          check_name: string;
          created_at: string;
          evidence: Json;
          executed_by: string | null;
          id: string;
          qa_run_id: string;
          release_candidate_id: string;
          result: Database["public"]["Enums"]["pi_qa_result"];
        };
        Insert: {
          check_name: string;
          created_at?: string;
          evidence?: Json;
          executed_by?: string | null;
          id?: string;
          qa_run_id: string;
          release_candidate_id: string;
          result: Database["public"]["Enums"]["pi_qa_result"];
        };
        Update: {
          check_name?: string;
          created_at?: string;
          evidence?: Json;
          executed_by?: string | null;
          id?: string;
          qa_run_id?: string;
          release_candidate_id?: string;
          result?: Database["public"]["Enums"]["pi_qa_result"];
        };
        Relationships: [
          {
            foreignKeyName: "release_qa_results_release_candidate_id_fkey";
            columns: ["release_candidate_id"];
            isOneToOne: false;
            referencedRelation: "release_candidates";
            referencedColumns: ["id"];
          },
        ];
      };
      seo_records: {
        Row: {
          approved_at: string | null;
          approved_by: string | null;
          canonical_path: string;
          created_at: string;
          entity_type: string;
          external_key: string;
          id: string;
          locale: string;
          meta_description: string;
          primary_keyword: string | null;
          product_category_id: string | null;
          product_series_id: string | null;
          product_variant_id: string | null;
          publication_status: string;
          raw_snapshot: Json;
          search_intent: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          approved_at?: string | null;
          approved_by?: string | null;
          canonical_path: string;
          created_at?: string;
          entity_type: string;
          external_key: string;
          id?: string;
          locale?: string;
          meta_description: string;
          primary_keyword?: string | null;
          product_category_id?: string | null;
          product_series_id?: string | null;
          product_variant_id?: string | null;
          publication_status?: string;
          raw_snapshot?: Json;
          search_intent: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          approved_at?: string | null;
          approved_by?: string | null;
          canonical_path?: string;
          created_at?: string;
          entity_type?: string;
          external_key?: string;
          id?: string;
          locale?: string;
          meta_description?: string;
          primary_keyword?: string | null;
          product_category_id?: string | null;
          product_series_id?: string | null;
          product_variant_id?: string | null;
          publication_status?: string;
          raw_snapshot?: Json;
          search_intent?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "seo_records_product_category_id_fkey";
            columns: ["product_category_id"];
            isOneToOne: false;
            referencedRelation: "product_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "seo_records_product_series_id_fkey";
            columns: ["product_series_id"];
            isOneToOne: false;
            referencedRelation: "product_series";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "seo_records_product_variant_id_fkey";
            columns: ["product_variant_id"];
            isOneToOne: false;
            referencedRelation: "pi_variant_readiness";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "seo_records_product_variant_id_fkey";
            columns: ["product_variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      series_components: {
        Row: {
          component_key: string;
          component_name: string;
          created_at: string;
          external_key: string;
          id: string;
          lifecycle_status: string;
          raw_snapshot: Json;
          scope: string;
          series_id: string;
          target_variant_id: string | null;
          updated_at: string;
          variant_key: string;
          variant_label: string;
        };
        Insert: {
          component_key: string;
          component_name: string;
          created_at?: string;
          external_key: string;
          id?: string;
          lifecycle_status?: string;
          raw_snapshot?: Json;
          scope: string;
          series_id: string;
          target_variant_id?: string | null;
          updated_at?: string;
          variant_key: string;
          variant_label: string;
        };
        Update: {
          component_key?: string;
          component_name?: string;
          created_at?: string;
          external_key?: string;
          id?: string;
          lifecycle_status?: string;
          raw_snapshot?: Json;
          scope?: string;
          series_id?: string;
          target_variant_id?: string | null;
          updated_at?: string;
          variant_key?: string;
          variant_label?: string;
        };
        Relationships: [
          {
            foreignKeyName: "series_components_series_id_fkey";
            columns: ["series_id"];
            isOneToOne: false;
            referencedRelation: "product_series";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "series_components_target_variant_id_fkey";
            columns: ["target_variant_id"];
            isOneToOne: false;
            referencedRelation: "pi_variant_readiness";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "series_components_target_variant_id_fkey";
            columns: ["target_variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      technical_documents: {
        Row: {
          created_at: string;
          document_type: string;
          external_key: string;
          file_hash: string | null;
          id: string;
          public_url: string | null;
          publication_status: string;
          raw_snapshot: Json;
          source_level: Database["public"]["Enums"]["pi_source_level"] | null;
          source_reference: string;
          source_type: string;
          storage_bucket: string | null;
          storage_path: string | null;
          title: string;
          updated_at: string;
          usage_rights_status: string;
        };
        Insert: {
          created_at?: string;
          document_type: string;
          external_key: string;
          file_hash?: string | null;
          id?: string;
          public_url?: string | null;
          publication_status?: string;
          raw_snapshot?: Json;
          source_level?: Database["public"]["Enums"]["pi_source_level"] | null;
          source_reference: string;
          source_type: string;
          storage_bucket?: string | null;
          storage_path?: string | null;
          title: string;
          updated_at?: string;
          usage_rights_status?: string;
        };
        Update: {
          created_at?: string;
          document_type?: string;
          external_key?: string;
          file_hash?: string | null;
          id?: string;
          public_url?: string | null;
          publication_status?: string;
          raw_snapshot?: Json;
          source_level?: Database["public"]["Enums"]["pi_source_level"] | null;
          source_reference?: string;
          source_type?: string;
          storage_bucket?: string | null;
          storage_path?: string | null;
          title?: string;
          updated_at?: string;
          usage_rights_status?: string;
        };
        Relationships: [];
      };
      technical_field_definitions: {
        Row: {
          applies_to: string[];
          created_at: string;
          default_unit: string | null;
          field_key: string;
          id: string;
          is_critical: boolean;
          label: string;
          updated_at: string;
          value_type: string;
        };
        Insert: {
          applies_to?: string[];
          created_at?: string;
          default_unit?: string | null;
          field_key: string;
          id?: string;
          is_critical?: boolean;
          label: string;
          updated_at?: string;
          value_type?: string;
        };
        Update: {
          applies_to?: string[];
          created_at?: string;
          default_unit?: string | null;
          field_key?: string;
          id?: string;
          is_critical?: boolean;
          label?: string;
          updated_at?: string;
          value_type?: string;
        };
        Relationships: [];
      };
      technical_value_evidence: {
        Row: {
          created_at: string;
          evidence_role: string;
          evidence_source_id: string;
          technical_value_id: string;
        };
        Insert: {
          created_at?: string;
          evidence_role?: string;
          evidence_source_id: string;
          technical_value_id: string;
        };
        Update: {
          created_at?: string;
          evidence_role?: string;
          evidence_source_id?: string;
          technical_value_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "technical_value_evidence_evidence_source_id_fkey";
            columns: ["evidence_source_id"];
            isOneToOne: false;
            referencedRelation: "evidence_sources";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "technical_value_evidence_technical_value_id_fkey";
            columns: ["technical_value_id"];
            isOneToOne: false;
            referencedRelation: "technical_values";
            referencedColumns: ["id"];
          },
        ];
      };
      technical_values: {
        Row: {
          confirmation_requirements: string[];
          confirmed_at: string | null;
          confirmed_by: string | null;
          created_at: string;
          external_key: string;
          field_definition_id: string;
          id: string;
          legacy_reviewed_by: string | null;
          legacy_reviewed_date: string | null;
          product_variant_id: string | null;
          public_note: string | null;
          raw_snapshot: Json;
          series_component_id: string | null;
          source_level: Database["public"]["Enums"]["pi_source_level"];
          source_type: string;
          unit: string | null;
          updated_at: string;
          value_text: string;
          variant_label: string | null;
          verification_status: Database["public"]["Enums"]["pi_verification_status"];
        };
        Insert: {
          confirmation_requirements?: string[];
          confirmed_at?: string | null;
          confirmed_by?: string | null;
          created_at?: string;
          external_key: string;
          field_definition_id: string;
          id?: string;
          legacy_reviewed_by?: string | null;
          legacy_reviewed_date?: string | null;
          product_variant_id?: string | null;
          public_note?: string | null;
          raw_snapshot?: Json;
          series_component_id?: string | null;
          source_level: Database["public"]["Enums"]["pi_source_level"];
          source_type: string;
          unit?: string | null;
          updated_at?: string;
          value_text: string;
          variant_label?: string | null;
          verification_status: Database["public"]["Enums"]["pi_verification_status"];
        };
        Update: {
          confirmation_requirements?: string[];
          confirmed_at?: string | null;
          confirmed_by?: string | null;
          created_at?: string;
          external_key?: string;
          field_definition_id?: string;
          id?: string;
          legacy_reviewed_by?: string | null;
          legacy_reviewed_date?: string | null;
          product_variant_id?: string | null;
          public_note?: string | null;
          raw_snapshot?: Json;
          series_component_id?: string | null;
          source_level?: Database["public"]["Enums"]["pi_source_level"];
          source_type?: string;
          unit?: string | null;
          updated_at?: string;
          value_text?: string;
          variant_label?: string | null;
          verification_status?: Database["public"]["Enums"]["pi_verification_status"];
        };
        Relationships: [
          {
            foreignKeyName: "technical_values_field_definition_id_fkey";
            columns: ["field_definition_id"];
            isOneToOne: false;
            referencedRelation: "technical_field_definitions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "technical_values_product_variant_id_fkey";
            columns: ["product_variant_id"];
            isOneToOne: false;
            referencedRelation: "pi_variant_readiness";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "technical_values_product_variant_id_fkey";
            columns: ["product_variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "technical_values_series_component_id_fkey";
            columns: ["series_component_id"];
            isOneToOne: false;
            referencedRelation: "series_components";
            referencedColumns: ["id"];
          },
        ];
      };
      verification_events: {
        Row: {
          actor_id: string;
          after_value: Json | null;
          before_value: Json | null;
          created_at: string;
          decision: Database["public"]["Enums"]["pi_review_decision"];
          entity_id: string;
          entity_type: string;
          evidence_source_ids: string[];
          field_key: string | null;
          id: string;
          reason: string;
        };
        Insert: {
          actor_id: string;
          after_value?: Json | null;
          before_value?: Json | null;
          created_at?: string;
          decision: Database["public"]["Enums"]["pi_review_decision"];
          entity_id: string;
          entity_type: string;
          evidence_source_ids?: string[];
          field_key?: string | null;
          id?: string;
          reason: string;
        };
        Update: {
          actor_id?: string;
          after_value?: Json | null;
          before_value?: Json | null;
          created_at?: string;
          decision?: Database["public"]["Enums"]["pi_review_decision"];
          entity_id?: string;
          entity_type?: string;
          evidence_source_ids?: string[];
          field_key?: string | null;
          id?: string;
          reason?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      pi_dashboard_metrics: {
        Row: {
          metric: string | null;
          value: number | null;
        };
        Relationships: [];
      };
      pi_variant_readiness: {
        Row: {
          approved_seo_count: number | null;
          blocker_count: number | null;
          compatibility_conflict_count: number | null;
          compatibility_count: number | null;
          confirmed_compatibility_count: number | null;
          confirmed_technical_count: number | null;
          eligible_main_image_count: number | null;
          id: string | null;
          is_shadow: boolean | null;
          legacy_data_status: string | null;
          legacy_main_image_count: number | null;
          legacy_status: string | null;
          lifecycle_state: Database["public"]["Enums"]["pi_product_lifecycle"] | null;
          media_count: number | null;
          public_slug: string | null;
          seo_record_count: number | null;
          sku: string | null;
          technical_conflict_count: number | null;
          technical_value_count: number | null;
          unresolved_technical_count: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      pi_can_view_console: { Args: never; Returns: boolean };
      pi_current_shadow_counts: { Args: never; Returns: Json };
      pi_has_console_role: {
        Args: {
          required_roles: Database["public"]["Enums"]["pi_console_role"][];
        };
        Returns: boolean;
      };
      pi_is_valid_lifecycle_transition: {
        Args: {
          new_state: Database["public"]["Enums"]["pi_product_lifecycle"];
          old_state: Database["public"]["Enums"]["pi_product_lifecycle"];
        };
        Returns: boolean;
      };
      pi_reconcile_shadow_batch: { Args: { batch_id: string }; Returns: Json };
    };
    Enums: {
      pi_console_role: "owner" | "editor" | "reviewer" | "publisher" | "viewer";
      pi_import_status: "PREPARED" | "IMPORTING" | "IMPORTED" | "RECONCILED" | "FAILED";
      pi_product_lifecycle:
        | "DRAFT"
        | "INGESTED"
        | "DATA_INCOMPLETE"
        | "NEEDS_VERIFICATION"
        | "VERIFIED"
        | "READY_FOR_PUBLISH"
        | "QA_PASSED"
        | "PUBLISHED"
        | "NEEDS_UPDATE";
      pi_qa_result: "PASS" | "PASS_WITH_WARNINGS" | "BLOCKED";
      pi_release_status:
        | "DRAFT"
        | "FROZEN"
        | "QA_RUNNING"
        | "PASS"
        | "PASS_WITH_WARNINGS"
        | "BLOCKED"
        | "APPROVED"
        | "PUBLISHED"
        | "SUPERSEDED";
      pi_review_decision: "APPROVE" | "EDIT" | "REJECT";
      pi_source_level: "A" | "B" | "C" | "D";
      pi_verification_status:
        | "CONFIRMED"
        | "OEM_REFERENCE"
        | "STANDARD_REFERENCE"
        | "NEEDS_FACTORY_CONFIRMATION"
        | "DATA_CONFLICT";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      pi_console_role: ["owner", "editor", "reviewer", "publisher", "viewer"],
      pi_import_status: ["PREPARED", "IMPORTING", "IMPORTED", "RECONCILED", "FAILED"],
      pi_product_lifecycle: [
        "DRAFT",
        "INGESTED",
        "DATA_INCOMPLETE",
        "NEEDS_VERIFICATION",
        "VERIFIED",
        "READY_FOR_PUBLISH",
        "QA_PASSED",
        "PUBLISHED",
        "NEEDS_UPDATE",
      ],
      pi_qa_result: ["PASS", "PASS_WITH_WARNINGS", "BLOCKED"],
      pi_release_status: [
        "DRAFT",
        "FROZEN",
        "QA_RUNNING",
        "PASS",
        "PASS_WITH_WARNINGS",
        "BLOCKED",
        "APPROVED",
        "PUBLISHED",
        "SUPERSEDED",
      ],
      pi_review_decision: ["APPROVE", "EDIT", "REJECT"],
      pi_source_level: ["A", "B", "C", "D"],
      pi_verification_status: [
        "CONFIRMED",
        "OEM_REFERENCE",
        "STANDARD_REFERENCE",
        "NEEDS_FACTORY_CONFIRMATION",
        "DATA_CONFLICT",
      ],
    },
  },
} as const;
