import { useEffect, useState } from "react";
import type { Task, TaskToUpdate } from "./Types";
import db from "../firebase/config";
import { onValue, push, ref, remove, update } from "firebase/database";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const ToDoList = () => {
    const [taskList, setTaskList] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState("");
    const [currentPopover, setCurrentPopover] = useState<number | null>(null);
    const [taskToUpdate, setTaskToUpdate] = useState<TaskToUpdate | null>({
        text: "",
        complete: false,
    });

    const fbRef = ref(db, "tasks");

    const addTask = async () => {
        if (newTask.trim()) {
            try {
                await push(fbRef, {
                    text: newTask.trim(),
                    completed: false,
                });
            } catch (err) {
                console.log("Error adding new task: ", err);
            }
            setNewTask("");
        }
    };

    const deleteTask = async (id: string) => {
        try {
            const taskItemRef = ref(db, `tasks/${id}`);
            await remove(taskItemRef);
        } catch (err) {
            console.log("Error deleting task: ", err);
        }
    };

    const updateCompletionOnly = async (id: string, finish: boolean) => {
        try {
            const taskItemRef = ref(db, `tasks/${id}`);
            await update(taskItemRef, {
                completed: !finish,
            });
        } catch (err) {
            console.log("Error updating task completion: ", err);
        }
    };

    const updateWholeTask = async (id: string) => {
        if (taskToUpdate) {
            try {
                if (taskToUpdate.text.trim()) {
                    const taskItemRef = ref(db, `tasks/${id}`);
                    await update(taskItemRef, {
                        text: taskToUpdate.text,
                        completed: taskToUpdate.complete,
                    }).then(() => {
                        setTaskToUpdate(null);
                        setCurrentPopover(null);
                    });
                } else {
                    throw new Error("Empty task");
                }
            } catch (err) {
                console.log("Error editing task: ", err);
            }
        }
    };

    const outsidePopoverClickHandler = (
        isOpen: boolean,
        id: number,
        taskText: string,
        done: boolean
    ) => {
        if (isOpen) {
            setCurrentPopover(id);
            setTaskToUpdate({ text: taskText, complete: done });
        } else {
            setCurrentPopover(null);
            setTaskToUpdate(null);
        }
    };

    useEffect(() => {
        const unsubscribe = onValue(fbRef, (snapshot) => {
            const data = snapshot.val();

            if (data) {
                const newTaskArray = Object.keys(data).map((key) => {
                    return {
                        id: key,
                        taskText: data[key].text,
                        completed: data[key].completed,
                    };
                });

                setTaskList(newTaskArray);
            } else {
                setTaskList([]);
            }
        });

        return () => unsubscribe();
    }, [fbRef]);

    return (
        <div className="w-3xl border-2 border-amber-950 mx-auto mt-8 flex flex-col items-center p-3 bg-[rgb(255,230,0)]">
            <h1 className="text-5xl font-bold mb-10">To-Do List</h1>
            <div className="w-[55%] flex justify-between px-1 pb-6">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => {
                        setNewTask(e.target.value);
                    }}
                    className="border w-75 outline-0 px-1.5 py-1 bg-white border-gray-600"
                    placeholder="Add a task..."
                />
                <button
                    onClick={addTask}
                    className="cursor-pointer outline-0 rounded-[4.2px] bg-green-500 px-4 py-1 hover:bg-green-600 active:bg-green-800 active:text-gray-200"
                >
                    Add Task
                </button>
            </div>
            <div className="w-full flex flex-col justify-center items-center">
                <div className="w-[73%] flex justify-center items-center py-3 mb-7 text-3xl border-b border-black">
                    Task List
                </div>
                <ul className="w-full flex gap-3.5 flex-col justify-center items-center">
                    {taskList.map((task, index) => (
                        <li className="flex w-[72%] px-3 py-1.5 justify-between items-center bg-white rounded-[6px] shadow-[0px_2px_8px_0px_rgba(99,99,99,0.2)]">
                            <span
                                onClick={() =>
                                    updateCompletionOnly(
                                        task.id,
                                        task.completed
                                    )
                                }
                                className={`text-[16px] mr-3 cursor-default wrap-break-word overflow-hidden ${
                                    task.completed
                                        ? "line-through text-gray-400"
                                        : ""
                                }`}
                            >
                                {(function () {
                                    const temp = task.taskText.slice(
                                        0,
                                        task.taskText.length > 66
                                            ? 66
                                            : task.taskText.length
                                    );
                                    if (task.taskText.length < 67) {
                                        return temp;
                                    } else {
                                        return `${task.taskText.slice(
                                            0,
                                            66
                                        )}.....`;
                                    }
                                })()}
                            </span>
                            <Popover
                                modal={true}
                                open={currentPopover === index}
                                onOpenChange={(isOpen) =>
                                    outsidePopoverClickHandler(
                                        isOpen,
                                        index,
                                        task.taskText,
                                        task.completed
                                    )
                                }
                            >
                                <div className="flex ">
                                    <PopoverTrigger>
                                        <button
                                            onClick={() => {}}
                                            className="cursor-pointer w-16 border-none bg-none bg-gray-600 text-gray-300 text-center py-1 mr-3 rounded-[4.2px] hover:shadow-[0px_2px_16px_6px_rgba(149,157,165,0.3)] hover:text-gray-100"
                                        >
                                            Edit
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        align="center"
                                        side="left"
                                        className="flex flex-col gap-2 bg-gray-600/97 w-fit"
                                    >
                                        <input
                                            type="text"
                                            value={taskToUpdate?.text}
                                            onChange={(e) =>
                                                setTaskToUpdate({
                                                    text: e.target.value,
                                                    complete:
                                                        taskToUpdate!.complete,
                                                })
                                            }
                                            className="border w-75 outline-0 px-1.5 py-1 bg-white border-gray-600"
                                        />
                                        <div>
                                            <label
                                                htmlFor={`popoverCheckbox${index}`}
                                            >
                                                Completed:{" "}
                                            </label>
                                            <input
                                                id={`popoverCheckbox${index}`}
                                                type="checkbox"
                                                onChange={(e) =>
                                                    setTaskToUpdate({
                                                        text: taskToUpdate!
                                                            .text,
                                                        complete:
                                                            e.target.checked,
                                                    })
                                                }
                                                checked={taskToUpdate?.complete}
                                            />
                                        </div>
                                        <button
                                            onClick={() =>
                                                updateWholeTask(task.id)
                                            }
                                            className="mt-2 cursor-pointer border-none bg-none w-16 bg-green-500 hover:bg-green-600 active:bg-green-700 text-gray-800 text-center py-1 rounded-[4.2px] hover:shadow-[0px_2px_16px_6px_rgba(149,157,165,0.3)] hover:text-black"
                                        >
                                            Update
                                        </button>
                                    </PopoverContent>
                                    <button
                                        onClick={() => deleteTask(task.id)}
                                        className="cursor-pointer border-none bg-none w-16 bg-orange-700 text-gray-800 text-center py-1 rounded-[4.2px] hover:shadow-[0px_2px_16px_6px_rgba(149,157,165,0.3)] hover:text-black"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </Popover>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ToDoList;
