import { Database } from './SupabaseSchema';

interface DbDefaultSchema {
  id: string;
  created_at?: string | null;
  updated_at?: string | null;
}
export type DbColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
type DbRow<T extends DbTables> = Database['public']['Tables'][T]['Row'];
type DbRowSummary<T extends DbTables, K extends keyof DbRow<T>> = Pick<DbRow<T>, K>;
type DbInsert<T extends DbTables> = Omit<Database['public']['Tables'][T]['Insert'], keyof DbDefaultSchema>;
type DbUpdate<T extends DbTables> = Omit<Database['public']['Tables'][T]['Update'], keyof DbDefaultSchema>;
type DbTables = keyof Database['public']['Tables'];

/**
 * Master Data
 */

export type DbMasterStackResponse = DbRow<'master_stack'>;
export type DbMasterStackCreate = DbInsert<'master_stack'>;
export type DbMasterStackUpdate = DbUpdate<'master_stack'>;

export type DbMasterTagResponse = DbRow<'master_tag'>;
export type DbMasterTagCreate = DbInsert<'master_tag'>;
export type DbMasterTagUpdate = DbUpdate<'master_tag'>;

export type DbCommentResponse = DbRow<'comments'> & { reply_to?: DbRow<'comments'> | (string & {}[]) };
type CommentSummary = 'id' | 'user_id' | 'user_name' | 'user_avatar' | 'content' | 'is_published';
export type DbCommentSummary = Pick<DbRow<'comments'>, CommentSummary>;
export type DbCommentCreate = DbInsert<'comments'>;
export type DbCommentUpdate = DbUpdate<'comments'>;

export type DbReportResponse = DbRow<'reported_comments'>;
export type DbReportCreate = DbInsert<'reported_comments'>;
export type DbReportUpdate = DbUpdate<'reported_comments'>;

/**
 * ====================
 */

/**
 * Project Data
 */
export type DbProjectResponse = DbRow<'projects'> & {
  stacks: DbMasterStackResponse[];
  comments: DbCommentResponse[];
};
type ProjectSummary = 'title' | 'summary' | 'views' | 'thumbnail_url';
export type DbProjectResponseSummary = Pick<DbRow<'projects'>, ProjectSummary> & {
  comments: number;
  stacks: DbMasterStackResponse[];
} & DbDefaultSchema;
export type DbProjectCreate = DbInsert<'projects'>;
export type DbProjectUpdate = DbUpdate<'projects'>;

/**
 * Blog Data
 */
export type DbBlogResponse = DbRow<'blogs'> & {
  tags: DbMasterTagResponse[];
  comments: DbCommentResponse[];
};
type BlogSummary = 'title' | 'summary' | 'views' | 'thumbnail_url' | 'is_featured';
export type DbBlogResponseSummary = Pick<DbRow<'blogs'>, BlogSummary> & {
  comments: number;
  tags: DbMasterTagResponse[];
} & DbDefaultSchema;
export type DbBlogCreate = DbInsert<'blogs'>;
export type DbBlogUpdate = DbUpdate<'blogs'>;

/**
 * Stuff Data
 */
export type DbStuffResponse = DbRow<'stuff'> & {
  tags: DbMasterTagResponse[];
  comments: DbCommentResponse[];
};
type StuffSummary = 'title' | 'summary' | 'views' | 'thumbnail_url' | 'is_nsfw';
export type DbStuffResponseSummary = Pick<DbRow<'stuff'>, StuffSummary> & {
  comments: number;
  tags: DbMasterTagResponse[];
  is_images: boolean;
  is_videos: boolean;
  is_sketchfab: boolean;
} & DbDefaultSchema;
export type DbStuffCreate = DbInsert<'stuff'>;
export type DbStuffUpdate = DbUpdate<'stuff'>;

/**
 * ====================
 */

/**
 * Contact Form Data
 * Note: There won't be any update method for this.
 * I'll add a logic to delete the data after I replied to the user.
 */
export type DbContactFormResponse = DbRow<'contact_form'>;
export type DbContactFormCreate = DbInsert<'contact_form'>;

/**
 * Guestbook Data
 */
export type DbGuestbookResponse = DbRow<'guestbook'>;
export type DbGuestbookCreate = DbInsert<'guestbook'>;
export type DbGuestbookUpdate = DbUpdate<'guestbook'>;
