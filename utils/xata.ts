// Generated by Xata Codegen 0.29.4. Please do not edit.
import type { BaseClientOptions, SchemaInference, XataRecord } from '@xata.io/client';
import { buildClient } from '@xata.io/client';

const tables = [
  {
    name: 'tag',
    columns: [{ name: 'name', type: 'string', notNull: true, defaultValue: 'gallery' }],
    revLinks: [{ column: 'tag', table: 'tag-to-image' }]
  },
  {
    name: 'image',
    columns: [
      { name: 'name', type: 'string', notNull: true, defaultValue: 'Image' },
      { name: 'image', type: 'file', file: { defaultPublicAccess: true } }
    ],
    revLinks: [{ column: 'image', table: 'tag-to-image' }]
  },
  {
    name: 'tag-to-image',
    columns: [
      { name: 'image', type: 'link', link: { table: 'image' } },
      { name: 'tag', type: 'link', link: { table: 'tag' } }
    ]
  }
] as const;

export type SchemaTables = typeof tables;
export type InferredTypes = SchemaInference<SchemaTables>;

export type Tag = InferredTypes['tag'];
export type TagRecord = Tag & XataRecord;

export type Image = InferredTypes['image'];
export type ImageRecord = Image & XataRecord;

export type TagToImage = InferredTypes['tag-to-image'];
export type TagToImageRecord = TagToImage & XataRecord;

export type DatabaseSchema = {
  tag: TagRecord;
  image: ImageRecord;
  'tag-to-image': TagToImageRecord;
};

const DatabaseClient = buildClient();

const defaultOptions = {
  databaseURL: 'https://sample-databases-v0sn1n.us-east-1.xata.sh/db/gallery-example'
};

export class XataClient extends DatabaseClient<DatabaseSchema> {
  constructor(options?: BaseClientOptions) {
    super({ ...defaultOptions, ...options }, tables);
  }
}

let instance: XataClient | undefined = undefined;

export const getXataClient = () => {
  if (instance) return instance;

  instance = new XataClient();
  return instance;
};
