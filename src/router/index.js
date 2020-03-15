import Vue from 'vue'
import Router from 'vue-router'

// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirect in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in subMenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if false, the item will hidden in breadcrumb(default is true)
  }
**/
export const constantRouterMap = [
  { path: '/login', component: () => import('@/views/login/index'), hidden: true },
  { path: '/404', component: () => import('@/views/404'), hidden: true },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    name: 'Dashboard',
    hidden: true,
    children: [{
      path: 'dashboard',
      component: () => import('@/views/dashboard/index')
    }]
  },
  {
    path: '',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard-2',
        meta: { title: '首页', icon: 'home' }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'User',
        component: () => import('@/views/user/userInfo'),
        meta: { title: '用户管理', icon: 'student' }
      }
    ]
  },

  // {
  //   path: '/notice',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       name: 'Notice',
  //       component: () => import('@/views/notice/infoTable'),
  //       meta: { title: '公告管理', icon: 'notice' }
  //     }
  //   ]
  // },

  {
    path: '/paper',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Paper',
        component: () => import('@/views/paper/paperInfo'),
        meta: { title: '试卷管理', icon: 'form' }
      }
    ]
  },

  {
    path: '/bank',
    component: Layout,
    redirect: '/bank/bank-single/single-info',
    name: 'Bank',
    meta: { title: '题库管理', icon: 'que-bank' },
    children: [
      {
        path: 'bank-single',
        component: () => import('@/views/bankManage/bankSingle/index'),
        name: 'BankSingle',
        redirect: '/bank/bank-single/single-info',
        meta: { title: '单选题库管理', icon: 'single-bank' },
        children: [
          {
            path: 'single-info',
            name: 'SingleInfo',
            component: () => import('@/views/bankManage/bankSingle/singleInfo'),
            meta: { title: '单选题信息管理', icon: 'single-info' }
          },
          {
            path: 'single-upload',
            name: 'SingleUpload',
            component: () => import('@/views/bankManage/bankSingle/singleUpload'),
            meta: { title: '上传单选题', icon: 'excel' }
          }
        ]
      },
      // {
      //   path: 'bank-multiple',
      //   component: () => import('@/views/bankManage/bankMultiple/index'),
      //   name: 'BankMultiple',
      //   redirect: '/bank/bank-multiple/multiple-info',
      //   meta: { title: '多选题库管理', icon: 'multiple-bank' },
      //   children: [
      //     {
      //       path: 'multiple-info',
      //       name: 'MultipleInfo',
      //       component: () => import('@/views/bankManage/bankMultiple/multipleInfo'),
      //       meta: { title: '多选题信息管理', icon: 'multiple-info' }
      //     },
      //     {
      //       path: 'multiple-upload',
      //       name: 'MultipleUpload',
      //       component: () => import('@/views/bankManage/bankMultiple/multipleUpload'),
      //       meta: { title: '上传多选题', icon: 'excel' }
      //     }
      //   ]
      // },
      {
        path: 'bank-judge',
        component: () => import('@/views/bankManage/bankJudge/index'),
        name: 'BankJudge',
        redirect: '/bank/bank-judge/judge-info',
        meta: { title: '判断题库管理', icon: 'judge-bank' },
        children: [
          {
            path: 'judge-info',
            name: 'JudgeInfo',
            component: () => import('@/views/bankManage/bankJudge/judgeInfo'),
            meta: { title: '判断题信息管理', icon: 'judge-info' }
          },
          {
            path: 'judge-upload',
            name: 'JudgeUpload',
            component: () => import('@/views/bankManage/bankJudge/judgeUpload'),
            meta: { title: '上传判断题', icon: 'excel' }
          }
        ]
      },
      {
        path: 'bank-fill',
        component: () => import('@/views/bankManage/bankFill/index'),
        name: 'BankFill',
        redirect: '/bank/bank-fill/fill-info',
        meta: { title: '填空题库管理', icon: 'fill-bank' },
        children: [
          {
            path: 'fill-info',
            name: 'FillInfo',
            component: () => import('@/views/bankManage/bankFill/fillInfo'),
            meta: { title: '填空题信息管理', icon: 'fill-info' }
          },
          {
            path: 'fill-upload',
            name: 'FillUpload',
            component: () => import('@/views/bankManage/bankFill/fillUpload'),
            meta: { title: '上传填空题', icon: 'excel' }
          }
        ]
      }
    ]
  },

  {
    path: '/type',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'type',
        component: () => import('@/views/type/typeTable'),
        meta: { title: '题型管理', icon: 'subject' }
      }
    ]
  },
  {
    path: '/rotation-img',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'RotationImg',
        component: () => import('@/views/rotationImg/rotationTable'),
        meta: { title: '轮播图管理', icon: 'rotation-img' }
      }
    ]
  },
  // {
  //   path: '/feedback',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       name: 'Feedback',
  //       component: () => import('@/views/feedback/feedbackTable'),
  //       meta: { title: '意见反馈', icon: 'notice' }
  //     }
  //   ]
  // },


  { path: '*', redirect: '/404', hidden: true }
]

export default new Router({
  mode: 'history',
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})
