import {MaterialListData} from "../components/MaterialOverview";


export interface MaterialListEntry {
    title: string;
    description: string;
    material_type: string;
    upstream_url: string;
    id: number;
}

// @TODO add more types
export const MaterialTypesArray = [
    {
        value: 'assignment',
        label: 'Assignment',
    },
    {
        value: 'slide',
        label: 'Slides',
    },
    {
        value: 'video',
        label: 'Video',
    },
    {
        value: 'lecture',
        label: 'Lecture',
    },
    {
        value: 'note',
        label: 'Notes',
    },
    {
        value: 'exam',
        label: 'Exam',
    },
    {
        value: 'project',
        label: 'Project',
    },
    {
        value: 'collection',
        label: 'Collection',
    },
    {
        value: 'other',
        label: 'Other',
    }
]

export const MaterialVisibilityArray = [
    {
        value: "public",
        label: "Public"
    },
    {
        value: "private",
        label: "Private",
    }
]

// @TODO finish the rest of the fields
export interface MaterialData {
    id: number | null;
    title: string;
    type: string;
    description: string
    instance_of: string;
    material_type: string;
    upstream_url: string;
    visibility: string;
    tags: TagData[];
    materials: MaterialListData[];
}

export interface TagData {
    id: number;
    title: string;
    bloom: string;
    type: string;
}

export interface OntologyData {
    id: number;
    title: string;
    instance_of: string;
    children: OntologyData[];
}
