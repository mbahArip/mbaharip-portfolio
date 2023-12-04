export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          path: string;
          size: number;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name: string;
          path: string;
          size?: number;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
          path?: string;
          size?: number;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          avatar: string | null;
          content: string;
          created_at: string;
          id: string;
          is_flagged: boolean;
          name: string;
          parent_id: string | null;
          reply_to: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          avatar?: string | null;
          content: string;
          created_at?: string;
          id?: string;
          is_flagged?: boolean;
          name: string;
          parent_id?: string | null;
          reply_to?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          avatar?: string | null;
          content?: string;
          created_at?: string;
          id?: string;
          is_flagged?: boolean;
          name?: string;
          parent_id?: string | null;
          reply_to?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_parent_id_fkey';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_reply_to_fkey';
            columns: ['reply_to'];
            isOneToOne: false;
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
        ];
      };
      guestbooks: {
        Row: {
          avatar: string | null;
          content: string;
          created_at: string;
          id: string;
          is_flagged: boolean;
          name: string;
          reply_to: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          avatar?: string | null;
          content: string;
          created_at?: string;
          id?: string;
          is_flagged?: boolean;
          name: string;
          reply_to?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          avatar?: string | null;
          content?: string;
          created_at?: string;
          id?: string;
          is_flagged?: boolean;
          name?: string;
          reply_to?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'guestbooks_reply_to_fkey';
            columns: ['reply_to'];
            isOneToOne: false;
            referencedRelation: 'guestbooks';
            referencedColumns: ['id'];
          },
        ];
      };
      mail: {
        Row: {
          content: string;
          created_at: string;
          from_mail: string;
          from_name: string;
          id: string;
          is_replied: boolean;
          replied_at: string | null;
          reply: string | null;
          updated_at: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          from_mail: string;
          from_name: string;
          id?: string;
          is_replied?: boolean;
          replied_at?: string | null;
          reply?: string | null;
          updated_at?: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          from_mail?: string;
          from_name?: string;
          id?: string;
          is_replied?: boolean;
          replied_at?: string | null;
          reply?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      master_cat: {
        Row: {
          color: string;
          created_at: string;
          description: string | null;
          id: string;
          slug: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          color?: string;
          created_at?: string;
          description?: string | null;
          id: string;
          slug?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          slug?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      master_tag: {
        Row: {
          color: string;
          created_at: string;
          description: string | null;
          id: string;
          slug: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          color?: string;
          created_at?: string;
          description?: string | null;
          id: string;
          slug?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          slug?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          category: string | null;
          content: string | null;
          created_at: string;
          extra_metadata: Json | null;
          id: string;
          is_featured: boolean;
          slug: string | null;
          status: Database['public']['Enums']['status'];
          summary: string | null;
          thumbnail_attachment: number | null;
          title: string;
          updated_at: string;
          views: number;
        };
        Insert: {
          category?: string | null;
          content?: string | null;
          created_at?: string;
          extra_metadata?: Json | null;
          id?: string;
          is_featured?: boolean;
          slug?: string | null;
          status: Database['public']['Enums']['status'];
          summary?: string | null;
          thumbnail_attachment?: number | null;
          title?: string;
          updated_at?: string;
          views?: number;
        };
        Update: {
          category?: string | null;
          content?: string | null;
          created_at?: string;
          extra_metadata?: Json | null;
          id?: string;
          is_featured?: boolean;
          slug?: string | null;
          status?: Database['public']['Enums']['status'];
          summary?: string | null;
          thumbnail_attachment?: number | null;
          title?: string;
          updated_at?: string;
          views?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'posts_category_fkey';
            columns: ['category'];
            isOneToOne: false;
            referencedRelation: 'master_cat';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_thumbnail_attachment_fkey';
            columns: ['thumbnail_attachment'];
            isOneToOne: false;
            referencedRelation: 'attachments';
            referencedColumns: ['id'];
          },
        ];
      };
      posts_comments_relations: {
        Row: {
          comment_id: string;
          post_id: string;
        };
        Insert: {
          comment_id: string;
          post_id: string;
        };
        Update: {
          comment_id?: string;
          post_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'posts_comments_relations_comment_id_fkey';
            columns: ['comment_id'];
            isOneToOne: false;
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_comments_relations_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
        ];
      };
      posts_tags_relations: {
        Row: {
          post_id: string;
          tag_id: string;
        };
        Insert: {
          post_id: string;
          tag_id: string;
        };
        Update: {
          post_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'posts_tags_relations_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_tags_relations_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'master_tag';
            referencedColumns: ['id'];
          },
        ];
      };
      reports: {
        Row: {
          comment_id: string;
          created_at: string;
          email: string | null;
          id: number;
          is_approved: boolean;
          name: string;
          reason: string;
          reporter_id: string;
          updated_at: string;
        };
        Insert: {
          comment_id: string;
          created_at?: string;
          email?: string | null;
          id?: number;
          is_approved?: boolean;
          name: string;
          reason: string;
          reporter_id: string;
          updated_at?: string;
        };
        Update: {
          comment_id?: string;
          created_at?: string;
          email?: string | null;
          id?: number;
          is_approved?: boolean;
          name?: string;
          reason?: string;
          reporter_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reports_comment_id_fkey';
            columns: ['comment_id'];
            isOneToOne: false;
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
        ];
      };
      settings: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          updated_at: string;
          value: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id: string;
          updated_at?: string;
          value: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          updated_at?: string;
          value?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      status: 'draft' | 'published' | 'unpublished' | 'flagged';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
