import { BlogPosts } from "app/components/posts";

export default function Page() {
    return (
        <section>
            <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
                bbw9n.io
            </h1>
            <p className="mb-4">
                {`Building scalable AI infrastructure systems, developer tools, and products that matter.`}
            </p>
            <div className="my-8">
                <BlogPosts />
            </div>
        </section>
    );
}
