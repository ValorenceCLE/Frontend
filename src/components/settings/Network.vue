<template>
    <div class="w-full h-full max-w-3xl mx-auto rounded-md">
        <div class="bg-gray-200 shadow-md rounded my-3 border-gray-400 border">
            <table class="text-left w-full border-collapse">
                <thead>
                    <th
                        class="py-3 text-center text-textColor bg-grey-lightest font-bold uppercase text-Subheader border-b border-grayDark"
                        colspan="2"
                    >
                        Network Settings
                    </th>
                </thead>
                <tbody class="text-Body font-semibold text-textColor">
                    <tr class="hover:bg-grey-lighter">
                        <td class="py-4 px-6 border-b border-grey-light">Use DHCP</td>
                        <td class="py-4 px-6 border-b border-grey-light">
                            <div class="flex">
                                <button class="bg-primaryMed hover:bg-primaryLight text-white font-semibold py-1 px-4 rounded-l">
                                    Yes
                                </button>
                                <button class="bg-primaryMed hover:bg-primaryLight text-white font-semibold py-1 px-4 rounded-r">
                                    No
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr class="hover:bg-grey-lighter">
                        <td class="py-4 px-6 border-b border-grey-light">IP Address</td>
                        <td class="py-4 px-6 border-b border-grey-light">
                            <input class="border-gray-400 border rounded" type="text" />
                        </td>
                    </tr>
                    <tr class="hover:bg-grey-lighter">
                        <td class="py-4 px-6 border-b border-grey-light">Perferd DNS</td>
                        <td class="py-4 px-6 border-b border-grey-light">
                            <input class="border-gray-400 border rounded" type="text" />
                        </td>
                    </tr>
                    <tr class="hover:bg-grey-lighter">
                        <td class="py-4 px-6 border-b border-grey-light">Alternate DNS</td>
                        <td class="py-4 px-6 border-b border-grey-light">
                            <input class="border-gray-400 border rounded" type="text" />
                        </td>
                    </tr>
                    <tr class="hover:bg-grey-lighter">
                        <td class="py-4 px-6 border-b border-grey-light">HTTPS Port</td>
                        <td class="py-4 px-6 border-b border-grey-light">
                            <input class="border-gray-400 border rounded" type="text" />
                        </td>
                    </tr>
                    <tr class="hover:bg-grey-lighter">
                        <td class="py-4 px-6 border-b border-grey-light text-center" colspan="2">
                            <button class="bg-primaryMed hover:bg-primaryLight text-white font-bold py-2 px-4 rounded">
                                Submit
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
export default {
  name: "Network",
};
</script>