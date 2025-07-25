
export interface Chat {
    id: number | null | undefined,
    isGroup: boolean,
    title?: string,
    other_user_id?: number,
    other_user_login?: string
}