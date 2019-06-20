<?php

namespace UserBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use UserBundle\Entity\User;
use UserBundle\Form\UserType;

class DefaultController extends Controller
{
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();
        $users = $em->getRepository(User::class)->findAll();
        return $this->render('@User/Default/index.html.twig',array('users'=>$users) );

    }
    public function createAction(Request $request){
        $user = new User();

        $form = $this->createForm(UserType::class, $user);
        $form->handleRequest($request); /*creation d'une session pr stocker les valeurs de l'input*/
        if ($form->isValid()) {
            $user->setEnabled(true);
            $em = $this->getDoctrine()->getManager();
            $em->persist($user);
            $em->flush();
            return $this->redirectToRoute("_list_users");

        }
        return $this->render('@User/Default/create.html.twig', array(
            'form' => $form->createView()
        ));



    }

    public function removeAction(Request $request,$id){
        $em=$this->getDoctrine()->getManager();
        $user=$em->getRepository("UserBundle:User")->find($id);
        if ($user!=null){
            $em->remove($user);
            $em->flush();
        }

        return $this->redirectToRoute("_list_users");
    }

    public function updateAction(Request $request,$id){

        $em=$this->getDoctrine()->getManager();
        $user=$em->getRepository("UserBundle:User")->find($id);
        $form=$this->createForm(UserType::class,$user);
        $form->handleRequest($request);

        if($form->isValid())
        {
            $em->persist($user);
            $em->flush();
            return $this->redirectToRoute('_list_users');
        }


        return $this->render("@User/Default/update.html.twig",array(
            'form'=>$form->createView()
        ));

    }


}
