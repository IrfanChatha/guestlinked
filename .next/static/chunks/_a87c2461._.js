(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/lib/supabaseClient.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "getSupabase": (()=>getSupabase),
    "supabase": (()=>supabase)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-client] (ecmascript)");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://jiiekvdjjxwmgcjdjzqs.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppaWVrdmRqanh3bWdjamRqenFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNDcyNTEsImV4cCI6MjA2NzcyMzI1MX0.8JRUeGhnF53BFeDX11VszSdJ-bo98QiKM4NI2CDbm4U");
let supabaseInstance;
const getSupabase = ()=>{
    if (!supabaseInstance) {
        if ("TURBOPACK compile-time falsy", 0) {
            "TURBOPACK unreachable";
        }
        supabaseInstance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createBrowserClient"])(supabaseUrl, supabaseAnonKey);
    }
    return supabaseInstance;
};
const supabase = getSupabase();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/buyer/add-website/page.jsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>AddWebsite)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabaseClient.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
'use client';
;
;
;
// CategoryDropdown component for multi-select functionality
function CategoryDropdown({ categories, selectedCategories, onCategoryToggle }) {
    _s();
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const filteredCategories = categories.filter((category)=>category.toLowerCase().includes(searchTerm.toLowerCase()));
    const handleToggleDropdown = ()=>{
        setIsOpen(!isOpen);
    };
    const handleCategoryClick = (category)=>{
        onCategoryToggle(category);
    };
    const handleSearchChange = (e)=>{
        setSearchTerm(e.target.value);
    };
    // Close dropdown when clicking outside
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CategoryDropdown.useEffect": ()=>{
            const handleClickOutside = {
                "CategoryDropdown.useEffect.handleClickOutside": (event)=>{
                    if (!event.target.closest('.category-dropdown')) {
                        setIsOpen(false);
                    }
                }
            }["CategoryDropdown.useEffect.handleClickOutside"];
            if (isOpen) {
                document.addEventListener('click', handleClickOutside);
            }
            return ({
                "CategoryDropdown.useEffect": ()=>{
                    document.removeEventListener('click', handleClickOutside);
                }
            })["CategoryDropdown.useEffect"];
        }
    }["CategoryDropdown.useEffect"], [
        isOpen
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative category-dropdown",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                onClick: handleToggleDropdown,
                className: "w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm",
                        children: selectedCategories.length === 0 ? 'Select categories...' : `${selectedCategories.length} category${selectedCategories.length > 1 ? 'ies' : 'y'} selected`
                    }, void 0, false, {
                        fileName: "[project]/app/buyer/add-website/page.jsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: `w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`,
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M19 9l-7 7-7-7"
                        }, void 0, false, {
                            fileName: "[project]/app/buyer/add-website/page.jsx",
                            lineNumber: 63,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/buyer/add-website/page.jsx",
                        lineNumber: 57,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/buyer/add-website/page.jsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute z-50 w-full mt-1 bg-gray-600 border border-gray-500 rounded-md shadow-lg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-2 border-b border-gray-500",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            value: searchTerm,
                            onChange: handleSearchChange,
                            placeholder: "Search categories...",
                            className: "w-full px-2 py-1 bg-gray-700 border border-gray-400 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        }, void 0, false, {
                            fileName: "[project]/app/buyer/add-website/page.jsx",
                            lineNumber: 72,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/buyer/add-website/page.jsx",
                        lineNumber: 71,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "max-h-40 overflow-y-auto",
                        children: filteredCategories.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-2 text-gray-400 text-sm",
                            children: "No categories found"
                        }, void 0, false, {
                            fileName: "[project]/app/buyer/add-website/page.jsx",
                            lineNumber: 84,
                            columnNumber: 15
                        }, this) : filteredCategories.map((category)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "flex items-center space-x-2 p-2 hover:bg-gray-500 cursor-pointer",
                                onClick: (e)=>e.stopPropagation(),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "checkbox",
                                        checked: selectedCategories.includes(category),
                                        onChange: ()=>handleCategoryClick(category),
                                        className: "form-checkbox text-blue-500 bg-gray-700 border-gray-400 rounded focus:ring-blue-500"
                                    }, void 0, false, {
                                        fileName: "[project]/app/buyer/add-website/page.jsx",
                                        lineNumber: 92,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-white",
                                        children: category
                                    }, void 0, false, {
                                        fileName: "[project]/app/buyer/add-website/page.jsx",
                                        lineNumber: 98,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, category, true, {
                                fileName: "[project]/app/buyer/add-website/page.jsx",
                                lineNumber: 87,
                                columnNumber: 17
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/buyer/add-website/page.jsx",
                        lineNumber: 82,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/buyer/add-website/page.jsx",
                lineNumber: 69,
                columnNumber: 9
            }, this),
            selectedCategories.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-2 flex flex-wrap gap-1",
                children: selectedCategories.map((cat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "bg-blue-600 text-white px-2 py-1 rounded-md text-xs",
                        children: [
                            cat,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>onCategoryToggle(cat),
                                className: "ml-1 text-blue-200 hover:text-white",
                                children: "×"
                            }, void 0, false, {
                                fileName: "[project]/app/buyer/add-website/page.jsx",
                                lineNumber: 112,
                                columnNumber: 15
                            }, this)
                        ]
                    }, cat, true, {
                        fileName: "[project]/app/buyer/add-website/page.jsx",
                        lineNumber: 110,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/buyer/add-website/page.jsx",
                lineNumber: 108,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/buyer/add-website/page.jsx",
        lineNumber: 46,
        columnNumber: 5
    }, this);
}
_s(CategoryDropdown, "yiEKKZ5M5ittB+we0Tvny3C+fRk=");
_c = CategoryDropdown;
// Component to display existing websites
function ExistingWebsites({ user }) {
    _s1();
    const [existingWebsites, setExistingWebsites] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [editingWebsite, setEditingWebsite] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editFormData, setEditFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        name: '',
        url: '',
        category: []
    });
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    // Comprehensive categories list
    const categories = [
        'Agriculture',
        'Animals and Pets',
        'Art',
        'Automobiles',
        'Beauty',
        'Books',
        'Business',
        'Career and Employment',
        'Computers',
        'Construction and Repairs',
        'Culture',
        'E-commerce',
        'Education',
        'Entertainment',
        'Environment',
        'Equipment',
        'Fashion',
        'Finance',
        'Food',
        'For Children',
        'For Men',
        'For Women',
        'Gadgets',
        'Games',
        'Hardware development',
        'Health',
        'Home and Family',
        'Humor',
        'Internet',
        'Law',
        'Leisure and Hobbies',
        'Lifestyle',
        'Literature',
        'Manufacturing',
        'Marketing and Advertising',
        'Media',
        'Miscellaneous',
        'Mobile',
        'Movies',
        'Music',
        'Nature',
        'News',
        'News and Media',
        'Personal Blogs',
        'Photography',
        'Places',
        'Politics',
        'Programming',
        'Public Service',
        'Real Estate',
        'Science',
        'Shopping',
        'Society',
        'Software development',
        'Sports',
        'Startups',
        'Technology',
        'Transport',
        'Travel',
        'Web-development'
    ];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ExistingWebsites.useEffect": ()=>{
            if (user) {
                fetchExistingWebsites();
            }
        }
    }["ExistingWebsites.useEffect"], [
        user
    ]);
    const fetchExistingWebsites = async ()=>{
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
            const { data, error } = await supabase.from('buyer_websites_tb').select('*').eq('buyer_id', user.user_id).order('added_at', {
                ascending: false
            });
            if (error) {
                console.error('Error fetching websites:', error);
            } else {
                setExistingWebsites(data || []);
            }
        } catch (error) {
            console.error('Error in fetchExistingWebsites:', error);
        } finally{
            setLoading(false);
        }
    };
    const handleEdit = (website)=>{
        setEditingWebsite(website.id);
        setEditFormData({
            name: website.website_name,
            url: website.website_url,
            category: Array.isArray(website.category) ? website.category : [
                website.category
            ].filter(Boolean)
        });
        setMessage('');
    };
    const handleCancelEdit = ()=>{
        setEditingWebsite(null);
        setEditFormData({
            name: '',
            url: '',
            category: []
        });
        setMessage('');
    };
    const handleCategoryToggle = (category)=>{
        setEditFormData((prev)=>({
                ...prev,
                category: prev.category.includes(category) ? prev.category.filter((c)=>c !== category) : [
                    ...prev.category,
                    category
                ]
            }));
    };
    const handleSaveEdit = async (websiteId)=>{
        if (!editFormData.name.trim() || !editFormData.url.trim() || editFormData.category.length === 0) {
            setMessage('All fields are required');
            return;
        }
        const urlPattern = /^https?:\/\/.+/;
        if (!urlPattern.test(editFormData.url.trim())) {
            setMessage('Please enter a valid URL starting with http:// or https://');
            return;
        }
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
            const { error } = await supabase.from('buyer_websites_tb').update({
                website_name: editFormData.name.trim(),
                website_url: editFormData.url.trim(),
                category: editFormData.category
            }).eq('id', websiteId);
            if (error) {
                console.error('Error updating website:', error);
                setMessage('Error updating website');
            } else {
                setMessage('Website updated successfully!');
                setEditingWebsite(null);
                fetchExistingWebsites(); // Refresh the list
                setTimeout(()=>setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error in handleSaveEdit:', error);
            setMessage('Error updating website');
        }
    };
    const handleDelete = async (websiteId, websiteName)=>{
        if (!confirm(`Are you sure you want to delete "${websiteName}"? This action cannot be undone.`)) {
            return;
        }
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
            const { error } = await supabase.from('buyer_websites_tb').delete().eq('id', websiteId);
            if (error) {
                console.error('Error deleting website:', error);
                setMessage('Error deleting website');
            } else {
                setMessage('Website deleted successfully!');
                fetchExistingWebsites(); // Refresh the list
                setTimeout(()=>setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error in handleDelete:', error);
            setMessage('Error deleting website');
        }
    };
    const formatDate = (dateString)=>{
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-8 bg-gray-800 rounded-lg p-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-semibold",
                        children: "Your Websites"
                    }, void 0, false, {
                        fileName: "[project]/app/buyer/add-website/page.jsx",
                        lineNumber: 326,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-gray-400 text-sm",
                        children: [
                            existingWebsites.length,
                            " website",
                            existingWebsites.length !== 1 ? 's' : ''
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/buyer/add-website/page.jsx",
                        lineNumber: 327,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/buyer/add-website/page.jsx",
                lineNumber: 325,
                columnNumber: 7
            }, this),
            message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `mb-4 p-3 rounded-md ${message.includes('successfully') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`,
                children: message
            }, void 0, false, {
                fileName: "[project]/app/buyer/add-website/page.jsx",
                lineNumber: 333,
                columnNumber: 9
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center py-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-gray-400",
                    children: "Loading your websites..."
                }, void 0, false, {
                    fileName: "[project]/app/buyer/add-website/page.jsx",
                    lineNumber: 344,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/buyer/add-website/page.jsx",
                lineNumber: 343,
                columnNumber: 9
            }, this) : existingWebsites.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center py-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-400",
                        children: "No websites added yet"
                    }, void 0, false, {
                        fileName: "[project]/app/buyer/add-website/page.jsx",
                        lineNumber: 348,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-gray-500 mt-2",
                        children: "Add your first website using the form above"
                    }, void 0, false, {
                        fileName: "[project]/app/buyer/add-website/page.jsx",
                        lineNumber: 349,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/buyer/add-website/page.jsx",
                lineNumber: 347,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-4",
                children: existingWebsites.map((website)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-700 rounded-lg p-4",
                        children: editingWebsite === website.id ? // Edit mode
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: editFormData.name,
                                            onChange: (e)=>setEditFormData((prev)=>({
                                                        ...prev,
                                                        name: e.target.value
                                                    })),
                                            className: "px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500",
                                            placeholder: "Website name"
                                        }, void 0, false, {
                                            fileName: "[project]/app/buyer/add-website/page.jsx",
                                            lineNumber: 359,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "url",
                                            value: editFormData.url,
                                            onChange: (e)=>setEditFormData((prev)=>({
                                                        ...prev,
                                                        url: e.target.value
                                                    })),
                                            className: "px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500",
                                            placeholder: "Website URL"
                                        }, void 0, false, {
                                            fileName: "[project]/app/buyer/add-website/page.jsx",
                                            lineNumber: 366,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/buyer/add-website/page.jsx",
                                    lineNumber: 358,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-gray-300 mb-2",
                                            children: "Categories * (Select multiple)"
                                        }, void 0, false, {
                                            fileName: "[project]/app/buyer/add-website/page.jsx",
                                            lineNumber: 375,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CategoryDropdown, {
                                            categories: categories,
                                            selectedCategories: editFormData.category,
                                            onCategoryToggle: handleCategoryToggle
                                        }, void 0, false, {
                                            fileName: "[project]/app/buyer/add-website/page.jsx",
                                            lineNumber: 378,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/buyer/add-website/page.jsx",
                                    lineNumber: 374,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex space-x-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleSaveEdit(website.id),
                                            className: "px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors",
                                            children: "Save"
                                        }, void 0, false, {
                                            fileName: "[project]/app/buyer/add-website/page.jsx",
                                            lineNumber: 385,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleCancelEdit,
                                            className: "px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm transition-colors",
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/app/buyer/add-website/page.jsx",
                                            lineNumber: 391,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/buyer/add-website/page.jsx",
                                    lineNumber: 384,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/buyer/add-website/page.jsx",
                            lineNumber: 357,
                            columnNumber: 17
                        }, this) : // View mode
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-between items-start",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold text-white mb-1",
                                            children: website.website_name
                                        }, void 0, false, {
                                            fileName: "[project]/app/buyer/add-website/page.jsx",
                                            lineNumber: 403,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: website.website_url,
                                            target: "_blank",
                                            rel: "noopener noreferrer",
                                            className: "text-blue-400 hover:text-blue-300 text-sm break-all",
                                            children: website.website_url
                                        }, void 0, false, {
                                            fileName: "[project]/app/buyer/add-website/page.jsx",
                                            lineNumber: 404,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center space-x-4 mt-2 text-sm text-gray-400",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-wrap gap-1",
                                                    children: (Array.isArray(website.category) ? website.category : [
                                                        website.category
                                                    ]).filter(Boolean).map((cat, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "bg-gray-600 px-2 py-1 rounded text-xs",
                                                            children: cat
                                                        }, index, false, {
                                                            fileName: "[project]/app/buyer/add-website/page.jsx",
                                                            lineNumber: 415,
                                                            columnNumber: 27
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/app/buyer/add-website/page.jsx",
                                                    lineNumber: 413,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: [
                                                        "Added ",
                                                        formatDate(website.added_at)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/buyer/add-website/page.jsx",
                                                    lineNumber: 420,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/buyer/add-website/page.jsx",
                                            lineNumber: 412,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/buyer/add-website/page.jsx",
                                    lineNumber: 402,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex space-x-2 ml-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleEdit(website),
                                            className: "p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-600 rounded-md transition-colors",
                                            title: "Edit website",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "w-4 h-4",
                                                fill: "none",
                                                stroke: "currentColor",
                                                viewBox: "0 0 24 24",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    strokeWidth: 2,
                                                    d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/buyer/add-website/page.jsx",
                                                    lineNumber: 430,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/buyer/add-website/page.jsx",
                                                lineNumber: 429,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/buyer/add-website/page.jsx",
                                            lineNumber: 424,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleDelete(website.id, website.website_name),
                                            className: "p-2 text-red-400 hover:text-red-300 hover:bg-gray-600 rounded-md transition-colors",
                                            title: "Delete website",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "w-4 h-4",
                                                fill: "none",
                                                stroke: "currentColor",
                                                viewBox: "0 0 24 24",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    strokeWidth: 2,
                                                    d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/buyer/add-website/page.jsx",
                                                    lineNumber: 439,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/buyer/add-website/page.jsx",
                                                lineNumber: 438,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/buyer/add-website/page.jsx",
                                            lineNumber: 433,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/buyer/add-website/page.jsx",
                                    lineNumber: 423,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/buyer/add-website/page.jsx",
                            lineNumber: 401,
                            columnNumber: 17
                        }, this)
                    }, website.id, false, {
                        fileName: "[project]/app/buyer/add-website/page.jsx",
                        lineNumber: 354,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/buyer/add-website/page.jsx",
                lineNumber: 352,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/buyer/add-website/page.jsx",
        lineNumber: 324,
        columnNumber: 5
    }, this);
}
_s1(ExistingWebsites, "ZEvFv4WWVc2P3YodxQUXFgGHvPE=");
_c1 = ExistingWebsites;
function AddWebsite() {
    _s2();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [submitting, setSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [websites, setWebsites] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([
        {
            id: 1,
            name: '',
            url: '',
            category: []
        }
    ]);
    const [nextId, setNextId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(2);
    // Comprehensive categories list
    const categories = [
        'Agriculture',
        'Animals and Pets',
        'Art',
        'Automobiles',
        'Beauty',
        'Books',
        'Business',
        'Career and Employment',
        'Computers',
        'Construction and Repairs',
        'Culture',
        'E-commerce',
        'Education',
        'Entertainment',
        'Environment',
        'Equipment',
        'Fashion',
        'Finance',
        'Food',
        'For Children',
        'For Men',
        'For Women',
        'Gadgets',
        'Games',
        'Hardware development',
        'Health',
        'Home and Family',
        'Humor',
        'Internet',
        'Law',
        'Leisure and Hobbies',
        'Lifestyle',
        'Literature',
        'Manufacturing',
        'Marketing and Advertising',
        'Media',
        'Miscellaneous',
        'Mobile',
        'Movies',
        'Music',
        'Nature',
        'News',
        'News and Media',
        'Personal Blogs',
        'Photography',
        'Places',
        'Politics',
        'Programming',
        'Public Service',
        'Real Estate',
        'Science',
        'Shopping',
        'Society',
        'Software development',
        'Sports',
        'Startups',
        'Technology',
        'Transport',
        'Travel',
        'Web-development'
    ];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AddWebsite.useEffect": ()=>{
            const checkUser = {
                "AddWebsite.useEffect.checkUser": async ()=>{
                    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) {
                        router.push('/');
                        return;
                    }
                    // Fetch user settings to verify role
                    const { data: settings, error: settingsError } = await supabase.from('users_settings_tb').select('*').eq('user_id', user.id).single();
                    if (settingsError || !settings) {
                        console.error('Error fetching user settings:', settingsError);
                        router.push('/');
                        return;
                    }
                    // Only buyers can add websites
                    if (settings.role !== 'Buyer') {
                        if (settings.role === 'Seller') {
                            router.push('/seller/seller-dashboard');
                        } else if (settings.role === 'Agent') {
                            router.push('/agent/dashboard');
                        } else {
                            router.push('/dashboard');
                        }
                        return;
                    }
                    setUser(settings);
                    setLoading(false);
                }
            }["AddWebsite.useEffect.checkUser"];
            checkUser();
        }
    }["AddWebsite.useEffect"], [
        router
    ]);
    const handleInputChange = (id, field, value)=>{
        setWebsites((prev)=>prev.map((website)=>website.id === id ? {
                    ...website,
                    [field]: value
                } : website));
    };
    const handleCategoryToggle = (websiteId, category)=>{
        setWebsites((prev)=>prev.map((website)=>{
                if (website.id === websiteId) {
                    const currentCategories = Array.isArray(website.category) ? website.category : [];
                    const newCategories = currentCategories.includes(category) ? currentCategories.filter((c)=>c !== category) : [
                        ...currentCategories,
                        category
                    ];
                    return {
                        ...website,
                        category: newCategories
                    };
                }
                return website;
            }));
    };
    const addWebsiteField = ()=>{
        setWebsites((prev)=>[
                ...prev,
                {
                    id: nextId,
                    name: '',
                    url: '',
                    category: []
                }
            ]);
        setNextId((prev)=>prev + 1);
    };
    const removeWebsiteField = (id)=>{
        if (websites.length > 1) {
            setWebsites((prev)=>prev.filter((website)=>website.id !== id));
        }
    };
    const handleSubmit = async (e)=>{
        e.preventDefault();
        // Filter out entries with empty required fields
        const validWebsites = websites.filter((website)=>website.name.trim() && website.url.trim() && Array.isArray(website.category) && website.category.length > 0);
        if (validWebsites.length === 0) {
            setMessage('Please fill in all fields for at least one website');
            return;
        }
        // Validate URL format
        const urlPattern = /^https?:\/\/.+/;
        const invalidUrls = validWebsites.filter((website)=>!urlPattern.test(website.url.trim()));
        if (invalidUrls.length > 0) {
            setMessage('Please enter valid URLs starting with http:// or https://');
            return;
        }
        setSubmitting(true);
        setMessage('');
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
            // Insert websites into buyer_websites_tb table
            const websitesToInsert = validWebsites.map((website)=>({
                    buyer_id: user.user_id,
                    website_name: website.name.trim(),
                    website_url: website.url.trim(),
                    category: website.category,
                    added_at: new Date().toISOString()
                }));
            const { error } = await supabase.from('buyer_websites_tb').insert(websitesToInsert);
            if (error) {
                console.error('Error adding websites:', error);
                setMessage('Error adding websites. Please try again.');
            } else {
                setMessage(`Successfully added ${validWebsites.length} website${validWebsites.length > 1 ? 's' : ''}!`);
                // Reset form
                setWebsites([
                    {
                        id: 1,
                        name: '',
                        url: '',
                        category: []
                    }
                ]);
                setNextId(2);
                // Redirect after success
                setTimeout(()=>{
                    router.push('/buyer/buyer-dashboard');
                }, 2000);
            }
        } catch (error) {
            console.error('Error submitting websites:', error);
            setMessage('An error occurred while adding the websites');
        } finally{
            setSubmitting(false);
        }
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-gray-900 flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-white text-xl",
                children: "Loading..."
            }, void 0, false, {
                fileName: "[project]/app/buyer/add-website/page.jsx",
                lineNumber: 669,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/buyer/add-website/page.jsx",
            lineNumber: 668,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gray-900 text-white",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "container mx-auto px-4 py-8",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-4xl mx-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>router.back(),
                                className: "text-blue-400 hover:text-blue-300 transition-colors duration-200 mb-4",
                                children: "← Back to Dashboard"
                            }, void 0, false, {
                                fileName: "[project]/app/buyer/add-website/page.jsx",
                                lineNumber: 679,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-3xl font-bold mb-2",
                                children: "Add Your Websites"
                            }, void 0, false, {
                                fileName: "[project]/app/buyer/add-website/page.jsx",
                                lineNumber: 685,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/buyer/add-website/page.jsx",
                        lineNumber: 678,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-800 rounded-lg p-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: handleSubmit,
                            className: "space-y-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-lg font-medium text-gray-300 mb-4",
                                            children: "Website Details *"
                                        }, void 0, false, {
                                            fileName: "[project]/app/buyer/add-website/page.jsx",
                                            lineNumber: 691,
                                            columnNumber: 17
                                        }, this),
                                        websites.map((website, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-gray-700 rounded-lg p-6 relative",
                                                children: [
                                                    websites.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex justify-end mb-4",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            onClick: ()=>removeWebsiteField(website.id),
                                                            className: "p-2 text-red-400 hover:text-red-300 hover:bg-gray-600 rounded-md transition-colors duration-200",
                                                            title: "Remove website",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                className: "w-5 h-5",
                                                                fill: "none",
                                                                stroke: "currentColor",
                                                                viewBox: "0 0 24 24",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                    strokeLinecap: "round",
                                                                    strokeLinejoin: "round",
                                                                    strokeWidth: 2,
                                                                    d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/buyer/add-website/page.jsx",
                                                                    lineNumber: 706,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/buyer/add-website/page.jsx",
                                                                lineNumber: 705,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/buyer/add-website/page.jsx",
                                                            lineNumber: 699,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/buyer/add-website/page.jsx",
                                                        lineNumber: 698,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                        className: "block text-sm font-medium text-gray-300 mb-2",
                                                                        children: "Website Name *"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/buyer/add-website/page.jsx",
                                                                        lineNumber: 714,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "text",
                                                                        value: website.name,
                                                                        onChange: (e)=>handleInputChange(website.id, 'name', e.target.value),
                                                                        className: "w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                                                        placeholder: "My Business Website",
                                                                        required: true
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/buyer/add-website/page.jsx",
                                                                        lineNumber: 717,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/buyer/add-website/page.jsx",
                                                                lineNumber: 713,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                        className: "block text-sm font-medium text-gray-300 mb-2",
                                                                        children: "Website URL *"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/buyer/add-website/page.jsx",
                                                                        lineNumber: 728,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "url",
                                                                        value: website.url,
                                                                        onChange: (e)=>handleInputChange(website.id, 'url', e.target.value),
                                                                        className: "w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                                                        placeholder: "https://example.com",
                                                                        required: true
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/buyer/add-website/page.jsx",
                                                                        lineNumber: 731,
                                                                        columnNumber: 17
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/buyer/add-website/page.jsx",
                                                                lineNumber: 727,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/buyer/add-website/page.jsx",
                                                        lineNumber: 712,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "block text-sm font-medium text-gray-300 mb-2",
                                                                children: "Categories * (Select multiple)"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/buyer/add-website/page.jsx",
                                                                lineNumber: 743,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CategoryDropdown, {
                                                                categories: categories,
                                                                selectedCategories: Array.isArray(website.category) ? website.category : [],
                                                                onCategoryToggle: (category)=>handleCategoryToggle(website.id, category)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/buyer/add-website/page.jsx",
                                                                lineNumber: 746,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/buyer/add-website/page.jsx",
                                                        lineNumber: 742,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, website.id, true, {
                                                fileName: "[project]/app/buyer/add-website/page.jsx",
                                                lineNumber: 696,
                                                columnNumber: 19
                                            }, this)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: addWebsiteField,
                                            className: "flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-200 p-3 border-2 border-dashed border-gray-600 hover:border-blue-400 rounded-lg w-full justify-center",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    className: "w-5 h-5",
                                                    fill: "none",
                                                    stroke: "currentColor",
                                                    viewBox: "0 0 24 24",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        strokeLinecap: "round",
                                                        strokeLinejoin: "round",
                                                        strokeWidth: 2,
                                                        d: "M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/buyer/add-website/page.jsx",
                                                        lineNumber: 761,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/buyer/add-website/page.jsx",
                                                    lineNumber: 760,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "Add another website"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/buyer/add-website/page.jsx",
                                                    lineNumber: 763,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/buyer/add-website/page.jsx",
                                            lineNumber: 755,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/buyer/add-website/page.jsx",
                                    lineNumber: 690,
                                    columnNumber: 15
                                }, this),
                                message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `p-4 rounded-md ${message.includes('Successfully') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`,
                                    children: message
                                }, void 0, false, {
                                    fileName: "[project]/app/buyer/add-website/page.jsx",
                                    lineNumber: 768,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-gray-700 rounded-lg p-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-sm font-medium text-gray-300 mb-2",
                                            children: "💡 Tips:"
                                        }, void 0, false, {
                                            fileName: "[project]/app/buyer/add-website/page.jsx",
                                            lineNumber: 778,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                            className: "text-sm text-gray-400 space-y-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: "• Add your websites for guest posting"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/buyer/add-website/page.jsx",
                                                    lineNumber: 780,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: '• Website name should be descriptive (e.g., "My Tech Blog")'
                                                }, void 0, false, {
                                                    fileName: "[project]/app/buyer/add-website/page.jsx",
                                                    lineNumber: 781,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: "• URLs must include http:// or https://"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/buyer/add-website/page.jsx",
                                                    lineNumber: 782,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: "• Use the dropdown to select multiple relevant categories"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/buyer/add-website/page.jsx",
                                                    lineNumber: 783,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/buyer/add-website/page.jsx",
                                            lineNumber: 779,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/buyer/add-website/page.jsx",
                                    lineNumber: 777,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex space-x-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            disabled: submitting,
                                            className: "flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-6 rounded-md font-medium transition-colors duration-200",
                                            children: submitting ? 'Adding Websites...' : `Add Websites`
                                        }, void 0, false, {
                                            fileName: "[project]/app/buyer/add-website/page.jsx",
                                            lineNumber: 788,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>router.back(),
                                            className: "px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors duration-200",
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/app/buyer/add-website/page.jsx",
                                            lineNumber: 796,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/buyer/add-website/page.jsx",
                                    lineNumber: 787,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/buyer/add-website/page.jsx",
                            lineNumber: 689,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/buyer/add-website/page.jsx",
                        lineNumber: 688,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ExistingWebsites, {
                        user: user
                    }, void 0, false, {
                        fileName: "[project]/app/buyer/add-website/page.jsx",
                        lineNumber: 807,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/buyer/add-website/page.jsx",
                lineNumber: 677,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/buyer/add-website/page.jsx",
            lineNumber: 676,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/buyer/add-website/page.jsx",
        lineNumber: 675,
        columnNumber: 5
    }, this);
}
_s2(AddWebsite, "SDsOn3J1TvYUIqsmh4bBLYyn1hU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c2 = AddWebsite;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "CategoryDropdown");
__turbopack_context__.k.register(_c1, "ExistingWebsites");
__turbopack_context__.k.register(_c2, "AddWebsite");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=_a87c2461._.js.map