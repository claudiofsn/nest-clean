export abstract class HashComparer {
    abstract compare({ plain, hash }: { plain: string, hash: string }): Promise<boolean>
}