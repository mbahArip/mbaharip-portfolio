import { Database } from './Schema';

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
type DbEnums = keyof Database['public']['Enums'];
export type DbEnum<T extends DbEnums> = Database['public']['Enums'][T];
export interface DbGetOptions<T extends DbTables> {
  ids?: string[] | null;
  page?: number | null;
  rowsPerPage?: number | null;
  query?: string | null;
  tags?: string[] | null;
  status?: DbEnum<'status'> | null;
  category?: string | null;
  order?: 'asc' | 'desc' | null;
  orderBy?: keyof DbRow<T> | null;
  is_featured?: boolean | null;
  is_reply?: boolean | null;
  is_flagged?: boolean | null;
}

// Master Category
export interface DbSchemaMasterCategory extends DbRow<'master_cat'> {}
export interface DbSchemaMasterCategoryInsert extends DbInsert<'master_cat'> {}
export interface DbSchemaMasterCategoryUpdate extends DbUpdate<'master_cat'> {}

// Master Tags
export interface DbSchemaMasterTag extends DbRow<'master_tag'> {}
export interface DbSchemaMasterTagInsert extends DbInsert<'master_tag'> {}
export interface DbSchemaMasterTagUpdate extends DbUpdate<'master_tag'> {}

// Attachments
export interface DbSchemaAttachment extends DbRow<'attachments'> {
  post?: DbSchemaPost;
}
export interface DbSchemaAttachmentInsert extends DbInsert<'attachments'> {}
export interface DbSchemaAttachmentUpdate extends DbUpdate<'attachments'> {}

// Comments
export interface DbSchemaComment extends DbRow<'comments'> {
  post?: Pick<DbSchemaPost, 'id' | 'title'> | null;
  reports?: number;
  reply?: number;
}
export interface DbSchemaCommentInsert extends DbInsert<'comments'> {}
export interface DbSchemaCommentUpdate extends DbUpdate<'comments'> {}

// Reports
export interface DbSchemaCommentReport extends DbRow<'reports'> {
  comment: DbSchemaComments;
}
export interface DbSchemaCommentReportInsert extends DbInsert<'reports'> {}
export interface DbSchemaCommentReportUpdate extends DbUpdate<'reports'> {}

// Posts
export interface DbSchemaPost extends Omit<DbRow<'posts'>, 'views'> {
  thumbnail_attachment: DbRow<'attachments'>;
  category: DbSchemaMasterCategory;
  tags: DbSchemaMasterTag[];
  comments?: DbSchemaComments[];
  count: {
    views: number;
    comments?: number;
  };
}
export interface DbSchemaPostInsert extends DbInsert<'posts'> {
  tags: DbSchemaMasterTagInsert[];
  newTags?: DbSchemaMasterTagInsert[];
}
export interface DbSchemaPostUpdate extends DbUpdate<'posts'> {
  tags?: DbSchemaMasterTag[];
  newTags?: DbSchemaMasterTag[];
}

// Guestbook
export interface DbSchemaGuestbook extends DbRow<'guestbook'> {
  reply_to?: DbSchemaGuestbook;
}
export interface DbSchemaGuestbookInsert extends DbInsert<'guestbook'> {}
export interface DbSchemaGuestbookUpdate extends DbUpdate<'guestbook'> {}

// Mail
export interface DbSchemaMail extends DbRow<'mail'> {}
export interface DbSchemaMailInsert extends DbInsert<'mail'> {}
export interface DbSchemaMailUpdate extends DbUpdate<'mail'> {}

// Settings
export interface DbSchemaSettings extends DbRow<'settings'> {}
export interface DbSchemaSettingsInsert extends DbInsert<'settings'> {}
export interface DbSchemaSettingsUpdate extends DbUpdate<'settings'> {}
