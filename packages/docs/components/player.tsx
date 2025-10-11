import type {ReactNode} from "react";
import {Player} from "@revideo/player-react";
import {project} from "./scene";
// import {transform} from "next/dist/build/swc";
// import motionCanvas from "@revideo/vite-plugin";
// import {build} from "vite";

interface DocsPlayerProps {
	preProps: {
		[key: string]: any;
	};
	preChildren: ReactNode;
	code: string;
}

export function DocsPlayer({preProps, preChildren, code}: DocsPlayerProps) {
	void preProps;
	void preChildren;
	void code;
	// const [project, setProject] = useState(null);

	// console.log({preProps, preChildren, code});
	// console.log(project);
	// console.log("hereee!");

	/*useEffect(() => {
		(async () => {
			const output = await build({
				configFile: false,
				plugins: [
					{
						name: "virtual-scene",
						resolveId(id) {
							if (id === "virtual-scene") {
								return id;
							}
						},
						load(id) {
							if (id === "virtual-scene") {
								return code;
							}
						},
					},
					motionCanvas({project: process.env.PROJECT_FILE}),
				],
				build: {
					write: false,
					lib: {
						entry: "virtual-scene",
						formats: ["es"],
					},
				},
			});

			const chunk = output[0];
			const module = new Function("exports", chunk.code)({});
			setProject(module.default);
		})();
	}, [code]);

	if (!project) {
		return <div>Loading!</div>;
	}*/

	return (
		<div className="w-full">
			<Player project={project} />
		</div>
	);
}
