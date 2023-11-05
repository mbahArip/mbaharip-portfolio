export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      blogs: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          is_featured: boolean;
          summary: string;
          thumbnail_url: string;
          title: string;
          updated_at: string;
          views: number;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          is_featured?: boolean;
          summary: string;
          thumbnail_url: string;
          title: string;
          updated_at?: string;
          views?: number;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          is_featured?: boolean;
          summary?: string;
          thumbnail_url?: string;
          title?: string;
          updated_at?: string;
          views?: number;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          is_me: boolean;
          is_published: boolean;
          parent_id: string | null;
          reply_to: string | null;
          updated_at: string;
          user_avatar: string | null;
          user_id: string;
          user_name: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          is_me?: boolean;
          is_published?: boolean;
          parent_id?: string | null;
          reply_to?: string | null;
          updated_at?: string;
          user_avatar?: string | null;
          user_id: string;
          user_name: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          is_me?: boolean;
          is_published?: boolean;
          parent_id?: string | null;
          reply_to?: string | null;
          updated_at?: string;
          user_avatar?: string | null;
          user_id?: string;
          user_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_parent_id_fkey';
            columns: ['parent_id'];
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_reply_to_fkey';
            columns: ['reply_to'];
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
        ];
      };
      contact_form: {
        Row: {
          created_at: string;
          email: string;
          id: number;
          message: string;
          name: string;
          type: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: number;
          message: string;
          name: string;
          type: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: number;
          message?: string;
          name?: string;
          type?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      guestbook: {
        Row: {
          avatar: string | null;
          created_at: string;
          id: number;
          is_me: boolean;
          message: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          avatar?: string | null;
          created_at?: string;
          id?: number;
          is_me?: boolean;
          message: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          avatar?: string | null;
          created_at?: string;
          id?: number;
          is_me?: boolean;
          message?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      map_blog_comment: {
        Row: {
          blog_id: string;
          comment_id: string;
        };
        Insert: {
          blog_id: string;
          comment_id: string;
        };
        Update: {
          blog_id?: string;
          comment_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'map_blog_comment_blog_id_fkey';
            columns: ['blog_id'];
            referencedRelation: 'blogs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'map_blog_comment_comment_id_fkey';
            columns: ['comment_id'];
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
        ];
      };
      map_blog_tag: {
        Row: {
          blog_id: string;
          tag_id: string;
        };
        Insert: {
          blog_id: string;
          tag_id: string;
        };
        Update: {
          blog_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'map_blog_tag_blog_id_fkey';
            columns: ['blog_id'];
            referencedRelation: 'blogs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'map_blog_tag_tag_id_fkey';
            columns: ['tag_id'];
            referencedRelation: 'master_tag';
            referencedColumns: ['id'];
          },
        ];
      };
      map_project_comment: {
        Row: {
          comment_id: string;
          project_id: string;
        };
        Insert: {
          comment_id: string;
          project_id: string;
        };
        Update: {
          comment_id?: string;
          project_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'map_project_comment_comment_id_fkey';
            columns: ['comment_id'];
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'map_project_comment_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      map_project_stack: {
        Row: {
          project_id: string;
          stack_id: string;
        };
        Insert: {
          project_id: string;
          stack_id: string;
        };
        Update: {
          project_id?: string;
          stack_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'map_project_stack_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'map_project_stack_stack_id_fkey';
            columns: ['stack_id'];
            referencedRelation: 'master_stack';
            referencedColumns: ['id'];
          },
        ];
      };
      map_stuff_comment: {
        Row: {
          comment_id: string;
          stuff_id: string;
        };
        Insert: {
          comment_id: string;
          stuff_id: string;
        };
        Update: {
          comment_id?: string;
          stuff_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'map_stuff_comment_comment_id_fkey';
            columns: ['comment_id'];
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'map_stuff_comment_stuff_id_fkey';
            columns: ['stuff_id'];
            referencedRelation: 'stuff';
            referencedColumns: ['id'];
          },
        ];
      };
      map_stuff_tag: {
        Row: {
          stuff_id: string;
          tag_id: string;
        };
        Insert: {
          stuff_id: string;
          tag_id: string;
        };
        Update: {
          stuff_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'map_stuff_tag_stuff_id_fkey';
            columns: ['stuff_id'];
            referencedRelation: 'stuff';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'map_stuff_tag_tag_id_fkey';
            columns: ['tag_id'];
            referencedRelation: 'master_tag';
            referencedColumns: ['id'];
          },
        ];
      };
      master_stack: {
        Row: {
          created_at: string;
          icon_url: string;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          icon_url: string;
          id: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          icon_url?: string;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      master_tag: {
        Row: {
          color: string | null;
          created_at: string;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string;
          id: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          color?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          content: string;
          created_at: string;
          demo_url: string | null;
          id: string;
          is_featured: boolean;
          source_url: string | null;
          summary: string;
          thumbnail_url: string;
          title: string;
          updated_at: string;
          views: number;
        };
        Insert: {
          content: string;
          created_at?: string;
          demo_url?: string | null;
          id?: string;
          is_featured?: boolean;
          source_url?: string | null;
          summary: string;
          thumbnail_url: string;
          title: string;
          updated_at?: string;
          views?: number;
        };
        Update: {
          content?: string;
          created_at?: string;
          demo_url?: string | null;
          id?: string;
          is_featured?: boolean;
          source_url?: string | null;
          summary?: string;
          thumbnail_url?: string;
          title?: string;
          updated_at?: string;
          views?: number;
        };
        Relationships: [];
      };
      reported_comments: {
        Row: {
          comment_id: string;
          created_at: string;
          id: number;
          reason: string;
          reported_by: string;
          updated_at: string;
        };
        Insert: {
          comment_id: string;
          created_at?: string;
          id?: number;
          reason: string;
          reported_by: string;
          updated_at?: string;
        };
        Update: {
          comment_id?: string;
          created_at?: string;
          id?: number;
          reason?: string;
          reported_by?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reported_comments_comment_id_fkey';
            columns: ['comment_id'];
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
      stuff: {
        Row: {
          created_at: string;
          id: string;
          image_urls: string[] | null;
          information: string | null;
          is_nsfw: boolean;
          sketchfab_url: string | null;
          summary: string;
          thumbnail_url: string;
          title: string;
          updated_at: string;
          video_urls: string[] | null;
          views: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_urls?: string[] | null;
          information?: string | null;
          is_nsfw?: boolean;
          sketchfab_url?: string | null;
          summary: string;
          thumbnail_url: string;
          title: string;
          updated_at?: string;
          video_urls?: string[] | null;
          views?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_urls?: string[] | null;
          information?: string | null;
          is_nsfw?: boolean;
          sketchfab_url?: string | null;
          summary?: string;
          thumbnail_url?: string;
          title?: string;
          updated_at?: string;
          video_urls?: string[] | null;
          views?: number;
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
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
