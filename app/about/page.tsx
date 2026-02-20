export default function AboutPage() {
    return (
        <section>
            <h1 className="font-semibold text-2xl mb-8 tracking-tighter">
                About
            </h1>
            <p className="mb-4">
                Welcome to my corner of the internet. I'm a software engineer
                passionate about building things and sharing what I learn along
                the way.
            </p>
            <p className="mb-4">
                This blog is where I write about software engineering, system
                design, and various technical topics that interest me.
            </p>
            <p>
                Feel free to reach out if you'd like to connect or collaborate
                on something interesting:{" "}
                <a
                    href="mailto:bbw9nio@gmail.com"
                    className="underline transition-all decoration-neutral-400 dark:decoration-neutral-600 underline-offset-2"
                >
                    bbw9nio@gmail.com
                </a>
            </p>
        </section>
    );
}
